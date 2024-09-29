import boto3
from flask import current_app, g
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo
from pymongo import MongoClient
import os 
from dotenv import load_dotenv
import certifi

MONGO_URL = os.getenv("MONGO_URL")

# Initialize MongoDB client and user collection
client = MongoClient(
   MONGO_URL,
   tlsCaFile=certifi.where()
)
user_db = client.get_database("users")
user = user_db.appdata

s3 = boto3.client(
    's3',
    #aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    #aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-east-2' 
)

# def get_db():
#     """
#     Configuration method to return db instance
#     """
#     db = getattr(g, "_database", None)
#     if db is None:
#         db = g._database = PyMongo(current_app).db
#     return db

# # Use LocalProxy to read the global db instance with just `db`
# db = LocalProxy(get_db)

