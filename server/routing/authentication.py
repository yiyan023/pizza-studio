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

    # attempt to find the user's email
    existing_email = user.find_one({"email": data.get('email')})

    # if the email exists, let the user know they already have an account
    if existing_email:
      return jsonify({"message": "Email exists"})

    # otherwise, insert data & return the message back to the user
    user.insert_one(data);
    return jsonify({"message": "Signup successful"})

  # if not POST request, incorrect API call
  else:
    return jsonify({"message": "Error signing up"}) 
  
@authentication.route('/login', methods=["POST", "GET"])
def login():
  global session

  if request.method == "POST":
    data = request.get_json()
    email, password = data.get('email'), data.get('password') 
    find_user = user.find_one({'email': email, 'password': password})

    if find_user:
      name = find_user.get('name')
      session = {"name":name, "email": email, "password": password}
      return jsonify({"message": "Signin successful", "user": session})
    
  return jsonify({"message": "Pizza Studio Authentication"})
