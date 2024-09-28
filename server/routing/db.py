from flask import current_app, g
from werkzeug.local import LocalProxy
from flask_pymongo import PyMongo
from pymongo import MongoClient

def get_db():
    """
    Configuration method to return db instance
    """
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = PyMongo(current_app).db
    return db

# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)

# Initialize MongoDB client and user collection
client = MongoClient(
    "mongodb+srv://irismo1009:zajtAWSqYIXaRGZN@technova.jbtdr.mongodb.net/?retryWrites=true&w=majority&appName=TechNova"
)
user_db = client.get_database("users")