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
from .db import user_db

load_dotenv()
audio_bp = Blueprint('audio', __name__)

@audio_bp.route('/', methods=['GET'])
def start():
    return jsonify({"hello":"world"}), 200

@audio_bp.route('/add_data', methods=['POST'])
def upload_data():
    user = user_db.appdata
    data = request.json
    result = user.insert_one(data) 
    return jsonify({"inserted_id": str(result.inserted_id)}), 201

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
            emotion_results = get_audio_emotions(file)
            print("emotion results: " + str(emotion_results))

            # save audio to cloud

            # upload data to database

            return jsonify({"transcript": transcript, "analysis": analysis, "emotions": emotion_results}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# get audio information from server
@audio_bp.route('/audio/<id>', methods=['GET'])
def get_audio(id):
    return "Get audio"
