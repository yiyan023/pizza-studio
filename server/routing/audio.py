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
from .db import user_db, user, s3

load_dotenv()
audio = Blueprint('audio', __name__)
BUCKET_NAME = 'pizzastudios'

@audio.route('/', methods=['GET'])
def start():
    return jsonify({"hello":"world"}), 200

# process + upload audio file to server
# pass in audio file, email, password
# returns mongodb id
@audio.route('/uploadProcessedAudio', methods=['POST'])
def upload_processed_audio():
    print("/uploadProcessedAudio called")
    audio_collection = user_db.audio
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    email = request.form.get('email')
    password = request.form.get('password')
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    user_entry = user.find_one({"email": email})
    if not user_entry or user_entry.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 403
    
    if file:
        try:
            # get transcript
            transcript = get_transcript(file)
            # transcript = "I'm sooo excited to go to the movies with you yay!!!"
            
            # get analysis of transcript
            analysis = analyze_text(transcript)
            # analysis = {
            #     "Danger likeliness": "Very unlikely",
            #     "Danger level": "Very low",
            #     "Key words": "N/A",
            #     "Person type": "N/A",
            #     "Abuse type": "N/A"
            # }

            # detect emotions (array)
            emotion_results = get_audio_emotions_file(file)
            # emotion_results = ["Disappointment", "Awkwardness"]

            # save audio to s3
            s3_url = upload_to_s3(file, os.getenv('AWS_S3_BUCKET_NAME'))
            if not s3_url:
                return jsonify({"error": "Failed to upload to S3"}), 500

            # upload data to database
            audio_data = {
                "email": email,
                "password": password,
                "transcript": transcript,
                "analysis": analysis,
                "emotions": emotion_results,
                "s3_url": s3_url
            }
            result = audio_collection.insert_one(audio_data)

            return jsonify({"transcript": transcript, "analysis": analysis, "emotions": emotion_results, "s3_url": s3_url, "id": str(result.inserted_id)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# upload audio file to server
# pass in audio file, email, password
# returns mongodb id
@audio.route('/uploadAudio', methods=['POST'])
def upload_audio():
    audio_collection = user_db.audio
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    user_entry = user.find_one({"email": email})
    if not user_entry or user_entry.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 403
    
    if file:
        try:
            # save audio to s3
            s3_url = upload_to_s3(file, os.getenv('AWS_S3_BUCKET_NAME'))
            if not s3_url:
                return jsonify({"error": "Failed to upload to S3"}), 500

            # upload data to database
            audio_data = {
                "email": email,
                "password": password,
                "s3_url": s3_url
            }
            
            result = audio_collection.insert_one(audio_data)

            return jsonify({"s3_url": s3_url, "id": str(result.inserted_id)}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# process audio file in mongodb server
# pass in email, password, audio_id
# returns nothing
@audio.route('/processAudio', methods=['POST'])
def process_audio():
    audio_collection = user_db.audio
    
    email = request.form.get('email')
    password = request.form.get('password')
    audio_id = request.form.get('id')

    if not email or not password or not audio_id:
        return jsonify({"error": "Email, password, and ID are required"}), 400
    user_entry = user.find_one({"email": email})
    if not user_entry or user_entry.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 403
    
    try:
        # Retrieve the database entry using the provided ID
        audio_data = audio_collection.find_one({"_id": ObjectId(audio_id)})
        if not audio_data:
            return jsonify({"error": "Audio data not found"}), 404

        # Verify that the email and password match the entry
        if audio_data.get("email") != email or audio_data.get("password") != password:
            return jsonify({"error": "Email or password does not match"}), 403

        # Get the audio file from S3
        s3_url = audio_data.get("s3_url")
        if not s3_url:
            return jsonify({"error": "S3 URL not found in the database entry"}), 404

        response = requests.get(s3_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to download audio file from S3"}), 500
        
        # Download the file from S3
        # object_name = s3_url.split('/')[-1]
        # file = tempfile.NamedTemporaryFile(delete=False)
        # s3.download_fileobj(BUCKET_NAME, object_name, file)
        # file.seek(0)

        # Save the downloaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name

        try:
            with open(temp_file_path, 'rb') as file:
                file.seek(0)

                # Process the audio file to get the transcript, analysis, and emotions
                transcript = get_transcript(file)
                analysis = analyze_text(transcript)
                emotion_results = get_audio_emotions_url(file)

                # Update the database entry with the new data
                audio_collection.update_one(
                    {"_id": ObjectId(audio_id)},
                    {"$set": {
                        "transcript": transcript,
                        "analysis": analysis,
                        "emotions": emotion_results
                    }}
                )

                return jsonify({"message": "Audio data processed and updated successfully"}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            os.unlink(temp_file_path)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# get all audios of user
# pass in user email
@audio.route('/audio/user/<user_email>', methods=['GET'])
def get_user_audio(user_email):
    audio_collection = user_db.audio
    try:
        # Find all audio data entries with the given email
        audio_data_list = list(audio_collection.find({"email": user_email}))
        if not audio_data_list:
            return jsonify({"error": "No audio data found for the given email"}), 404

        response_data = []
        for audio_data in audio_data_list:
            s3_url = audio_data.get("s3_url")
            object_name = s3_url.split('/')[-1]
            presigned_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': object_name},
                ExpiresIn=3600  # URL expires in 1 hour
            )
            response_data.append({
                "id": str(audio_data.get("_id")),
                "transcript": audio_data.get("transcript"),
                "analysis": audio_data.get("analysis"),
                "emotions": audio_data.get("emotions"),
                "s3_url": presigned_url
            })

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# get audio information from server
# pass in database id index, email, password
@audio.route('/audio/id/<id>', methods=['GET'])
def get_audio(id):
    audio_collection = user_db.audio

    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    user_entry = user.find_one({"email": email})
    if not user_entry or user_entry.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 403
    
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


# HELPER FUNCTIONS
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

    # print(response.to_json(indent=4))
    transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
    print("transcript: " + str(transcript))
    return transcript

def analyze_text(transcript):
    print("in analyze_text function")
    client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", 
             "content": "You will be given conversation transcripts. Analyze it to determine if there are signs that someone in the conversation is a victim or perpetrator of domestic abuse, sexual harassment, or general harassment. Format the response strictly as followed: \"[Word indicating likeliness of danger here, options: Very likely, Likely, Neutral, Unlikely, Very unlikely], [Word indicating level of danger here, options: Very high, High, Neutral, Low, Very low], [list specific language or behavior that suggests abuse, harassment, or danger directly from transcript separated by comments, only include words from the transcript], [Victim or perpetrator here], [Type of abuse or harassment here]\""},
            {
                "role": "user",
                "content": transcript
            }
        ]
    )
    full_analysis = response.choices[0].message.content
    analysis_lst = full_analysis.split(',')
    analysis_lst = [entry.replace('[', '').replace(']', '').strip() for entry in analysis_lst]
    print(analysis_lst)
    analysis_dict = {
        "Danger likeliness": analysis_lst[0].strip() if len(analysis_lst) > 0 and analysis_lst[0].strip() else "N/A",
        "Danger level": analysis_lst[1].strip() if len(analysis_lst) > 1 and analysis_lst[1].strip() else "N/A",
        "Key words": analysis_lst[2].strip() if len(analysis_lst) > 2 and analysis_lst[2].strip() else "N/A",
        "Person type": analysis_lst[3].strip() if len(analysis_lst) > 3 and analysis_lst[3].strip() else "N/A",
        "Abuse type": analysis_lst[4].strip() if len(analysis_lst) > 4 and analysis_lst[4].strip() else "N/A"
    }
    return analysis_dict

def get_audio_emotions_file(file):
    client = HumeBatchClient(os.getenv('HUMEAI_KEY'))

    # Create a temporary file to store the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        # Handle actual file object
        file.save(temp_file.name)
        temp_file_path = temp_file.name

    try:
        # Configure and run the emotion detection
        config = ProsodyConfig()
        job = client.submit_job(None, [config], files=[temp_file_path])
        
        print("Running...")
        
        results = job.await_complete()
        predictions = job.get_predictions()
        print(predictions)

        # Check if predictions contain emotions
        if (predictions and 
            'results' in predictions[0] and 
            'predictions' in predictions[0]['results'] and 
            predictions[0]['results']['predictions'] and 
            'models' in predictions[0]['results']['predictions'][0] and 
            'prosody' in predictions[0]['results']['predictions'][0]['models'] and 
            'grouped_predictions' in predictions[0]['results']['predictions'][0]['models']['prosody'] and 
            predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'] and 
            'predictions' in predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0] and 
            predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'] and 
            'emotions' in predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'][0]):
            emotion_scores = predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'][0]['emotions']
        else:
            emotion_scores = []

        # Sort based on confidence
        sorted_emotions = sorted(emotion_scores, key=lambda x: x['score'], reverse=True)
        top_emotions = sorted_emotions[:3]

        top_emotion_names = [emotion["name"] for emotion in top_emotions if emotion["score"] > 0.3]
        
        print(top_emotion_names)
        return top_emotion_names
    except Exception as e:
        print(f"Error processing audio emotions: {e}")
        return []
    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)

def get_audio_emotions_url(url):
    client = HumeBatchClient(os.getenv('HUMEAI_KEY'))

    try:
        # Configure and run the emotion detection using the URL
        config = ProsodyConfig()
        job = client.submit_job([url], [config])
        
        print("Running...")
        
        results = job.await_complete()
        predictions = job.get_predictions()
        print(predictions)

        # Check if predictions contain emotions
        if (predictions and 
            'results' in predictions[0] and 
            'predictions' in predictions[0]['results'] and 
            predictions[0]['results']['predictions'] and 
            'models' in predictions[0]['results']['predictions'][0] and 
            'prosody' in predictions[0]['results']['predictions'][0]['models'] and 
            'grouped_predictions' in predictions[0]['results']['predictions'][0]['models']['prosody'] and 
            predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'] and 
            'predictions' in predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0] and 
            predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'] and 
            'emotions' in predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'][0]):
            emotion_scores = predictions[0]['results']['predictions'][0]['models']['prosody']['grouped_predictions'][0]['predictions'][0]['emotions']
        else:
            emotion_scores = []

        # Sort based on confidence
        sorted_emotions = sorted(emotion_scores, key=lambda x: x['score'], reverse=True)
        top_emotions = sorted_emotions[:3]

        top_emotion_names = [emotion["name"] for emotion in top_emotions if emotion["score"] > 0.3]
        
        return top_emotion_names
    except Exception as e:
        print(f"Error processing audio emotions: {e}")
        return []

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
