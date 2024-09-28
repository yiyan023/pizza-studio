from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from deepgram import Deepgram
from dotenv import load_dotenv
import os
import requests
from .db import user_db

load_dotenv()
audio_bp = Blueprint('audio', __name__)
dg_client = Deepgram(os.getenv('DG_API_KEY'))

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
    
    # get transcription
    options = PrerecordedOptions(
        model="nova-2",
        smart_format=True,
        summarize="v2",
    )
    url_response = deepgram.listen.rest.v("1").transcribe_url(
        AUDIO_URL, options
    )
    print(url_response)
    # analyze text


    # detect emotions

    # upload file to cloud
    print("file type: " + str(type(file)))

    return "Upload"

# get audio information from server
@audio_bp.route('/audio/<id>', methods=['GET'])
def get_audio(id):
    return "Get audio"
