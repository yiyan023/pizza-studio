from flask import Blueprint, request, jsonify

auth = Blueprint('auth', __name__)

@auth.route('/')
def home():
  return "Pizza Studio Flask Server" 

@auth.route('/sign-up', methods=['POST', 'GET'])
def signup():
  if request.method == "POST":
    data = request.get_json()
    name = data.get('name')
    print(f"Name: {name}")
    return jsonify({'message': 'Sign-up successful', 'name': name}), 200 
  else:
    return "Pizza Studio Signup Server"