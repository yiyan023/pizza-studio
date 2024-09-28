from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
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
    
    # upload file 
    return "Upload"

# get audio information from server
@audio_bp.route('/audio/<id>', methods=['GET'])
def get_audio(id):
    return "Get audio"
