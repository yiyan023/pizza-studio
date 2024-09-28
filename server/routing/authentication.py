from flask import Blueprint, request, jsonify, current_app
from propelauth_flask import init_auth, current_user
import requests
from . import auth

authentication = Blueprint('authentication', __name__)

@authentication.route('/')
def home():
  return "Pizza Studio Flask Server" 

@authentication.route('/sign-up', methods=['POST'])
def signup():
  if request.method == "POST":
    data = request.get_json()
    email, password, metadata = data.get('email'), data.get('password'), data.get('metadata')
  else:
    return "Pizza Studio Signup Server"
  
@authentication.route('/login', methods=["POST", "GET"])
def login():
  if request.method == "POST":
    data = request.get_json()
    email, password = data.get('email'), data.get('password') 
  return "Pizza Studio Login Server"