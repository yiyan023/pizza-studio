from flask_cors import CORS
from routing import create_app

app = create_app()
CORS(app, origin=['http://localhost:8081'], methods=['POST'], allow_headers=['Content-Type'])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)