from flask import Flask, Blueprint
from dotenv import load_dotenv
from propelauth_flask import init_auth, current_user
import os

load_dotenv()

AUTH_URL = os.getenv("AUTH_URL")
API_KEY = os.getenv("AUTH_API_KEY")
auth = init_auth(AUTH_URL, API_KEY)

def create_app():
  app = Flask(__name__)

  from .authentication import authentication

  app.register_blueprint(authentication, url_prefix="/")
  app.config['AUTH_URL'] = AUTH_URL
  app.config['AUTH_API_KEY'] = API_KEY

  return app
