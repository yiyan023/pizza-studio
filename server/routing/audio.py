from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv
from openai import OpenAI
from hume import HumeBatchClient
from hume.models.config import ProsodyConfig
import tempfile
import os
import requests
from .db import user_db, s3

load_dotenv()
audio_bp = Blueprint('audio', __name__)
BUCKET_NAME = 'pizzastudios'

@audio_bp.route('/', methods=['GET'])
def start():
    return jsonify({"hello":"world"}), 200

# @audio_bp.route('/add_data', methods=['POST'])
# def upload_data():
#     user = user_db.appdata
#     data = request.json
#     result = user.insert_one(data) 
#     return jsonify({"inserted_id": str(result.inserted_id)}), 201

def get_transcript(file):
    # Read the file content + get transcription
    buffer_data = file.read()
    payload: FileSource = {
        "buffer": buffer_data,
    }
    options = PrerecordedOptions(
        smart_format=True, model="nova-2", summarize="v2", punctuate=True, language="en-US"
    )
    dg_client = DeepgramClient(os.getenv('DG_API_KEY'))
    response = dg_client.listen.rest.v("1").transcribe_file(payload, options)

    print(response.to_json(indent=4))
    transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
    print("transcript: " + str(transcript))
    return transcript

def analyze_text(transcript):
    client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", 
             "content": "You will be given conversation transcripts. Analyze it to determine if there are signs that someone in the conversation is a victim or perpetrator of domestic abuse, sexual harassment, or general harassment. Format the response strictly as followed: 1. Analysis: [Word indicating likeliness of danger here from very likely to very unlikely], [Word indicating level of danger here from very high to low], 2. Key words: [list specific language or behavior that suggests abuse, harassment, or danger directly from transcript separated by comments] 3. Type: [Victim or perpetrator], [Type of abuse or harassment here]"},
            {
                "role": "user",
                "content": transcript
            }
        ]
    )
    analysis = response.choices[0].message.content
    print("analysis: " + str(analysis))
    return analysis

def get_audio_emotions(file):
    client = HumeBatchClient(os.getenv('HUMEAI_KEY'))

     # Create a temporary file to store the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        file.save(temp_file.name)
        temp_file_path = temp_file.name

    try:
        # Configure and run the emotion detection
        config = ProsodyConfig()
        job = client.submit_job(None, [config], files=[temp_file_path])
        
        print(job)
        print("Running...")
        
        results = job.await_complete()
        predictions = job.get_predictions()
        print(predictions)

        emotion_scores = predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'][0]['emotions']
        # sort based on confidence
        sorted_emotions = sorted(emotion_scores, key=lambda x: x['score'], reverse=True)
        top_emotions = sorted_emotions[:3]
        
        return top_emotions
    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)

def upload_to_s3(file, object_name=None):
    if object_name is None:
        object_name = file.filename
    try:
        s3.upload_fileobj(file, BUCKET_NAME, object_name)
        # s3.upload_fileobj(file, BUCKET_NAME, object_name, ExtraArgs={'ACL': 'public-read'})
        return f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_name}"
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None

# process + upload audio file to server
@audio_bp.route('/uploadAudio', methods=['POST'])
def upload_audio():
    audio_collection = user_db.audio
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        try:
            # get transcript
            # transcript = get_transcript(file)
            transcript = "I'm sooo excited to go to the movies with you yay!!!"
            
            # get analysis of transcript
            # analysis = analyze_text(transcript)
            analysis = "1. Analysis: Very unlikely, Low  \n2. Key words: none  \n3. Type: None, None"

            # detect emotions (array)
            # emotion_results = get_audio_emotions(file)
            emotion_results = [
                {
                    "name": "Disappointment",
                    "score": 0.3283902704715729
                },
                {
                    "name": "Awkwardness",
                    "score": 0.2515967786312103
                },
                {
                    "name": "Amusement",
                    "score": 0.14033395051956177
                }
            ]
            print("emotion results: " + str(emotion_results))

            # save audio to s3
            s3_url = upload_to_s3(file, os.getenv('AWS_S3_BUCKET_NAME'))
            if not s3_url:
                return jsonify({"error": "Failed to upload to S3"}), 500

            # upload data to database
            audio_data = {
                "transcript": transcript,
                "analysis": analysis,
                "emotions": emotion_results,
                "s3_url": s3_url
            }
            result = audio_collection.insert_one(audio_data)

            return jsonify({"transcript": transcript, "analysis": analysis, "emotions": emotion_results, "s3_url": s3_url, "inserted_id": str(result.inserted_id)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# get audio information from server
@audio_bp.route('/audio/<id>', methods=['GET'])
def get_audio(id):
    audio_collection = user_db.audio
    try:
        audio_data = audio_collection.find_one({"_id": ObjectId(id)})
        if not audio_data:
            return jsonify({"error": "Audio data not found"}), 404

        # Generate a pre-signed URL for the audio file
        s3_url = audio_data.get("s3_url")
        object_name = s3_url.split('/')[-1]
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': object_name},
            ExpiresIn=3600  # URL expires in 1 hour
        )

        return jsonify({
            "transcript": audio_data.get("transcript"),
            "analysis": audio_data.get("analysis"),
            "emotions": audio_data.get("emotions"),
            "s3_url": presigned_url
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
