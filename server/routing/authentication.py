from flask import Blueprint, request, redirect, jsonify
import requests
from . import auth
from .db import user

authentication = Blueprint('authentication', __name__)
session = None

@authentication.route('/')
def home():
  return "Pizza Studio Flask Server" 

@authentication.route('/sign-up', methods=['POST'])
def signup():
  if request.method == "POST":
    data = request.get_json()
    user.insert_one(data);
    return jsonify({"message": "Signup successful"})
  else:
    return "Pizza Studio Signup Server"
  
@authentication.route('/login', methods=["POST", "GET"])
def login():
  global session

  if session:
    print("Logged in!")

  if request.method == "POST":
    data = request.get_json()
    email, password = data.get('email'), data.get('password') 
    find_user = user.find_one({'email': email, 'password': password})

    if find_user:
      session = find_user
      return jsonify({"message": "Signin successful"})
    
  return jsonify({"message": "Pizza Studio Authentication"})