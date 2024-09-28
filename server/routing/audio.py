from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv
import os
import requests
from .db import user_db

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

# process + upload audio file to server
@audio_bp.route('/upload', methods=['POST'])
def upload_audio():
    audio_collection = user_db.audio
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Read the file content
    buffer_data = file.read()
    payload: FileSource = {
        "buffer": buffer_data,
    }
    # get transcription
    options = PrerecordedOptions(
        smart_format=True, model="nova-2", summarize="v2", punctuate=True, language="en-US"
    )
    dg_client = DeepgramClient(os.getenv('DG_API_KEY'))
    response = dg_client.listen.rest.v("1").transcribe_file(payload, options)

    # response = dg_client.listen.rest.v('1').transcribe_url(AUDIO_URL, options)
    print(response.to_json(indent=4))
    transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
    print("transcript: " + str(transcript))
    
    # analyze text

    # detect emotions

    # upload file to cloud

    return jsonify({"transcript": transcript}), 200

# get audio information from server
@audio_bp.route('/audio/<id>', methods=['GET'])
def get_audio(id):
    return "Get audio"
