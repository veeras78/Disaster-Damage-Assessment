from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),"uploads"
)


os.makedirs(UPLOAD_FOLDER, exist_ok = True)


@app.route("/")
def home():
    return jsonify({
        "message": "Disaster Damage Assessment Backend is running!"
    })


@app.route("/test", methods=["GET"])
def test():
    return jsonify({
        "status": "success",
        "message": "Frontend can connect to Python backend."
    })


@app.route("/assess", methods=["POST"])
def assess():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data received"
        }), 400

    return jsonify({
        "status": "success",
        "message": "Assessment received successfully",
        "received_data": data
    })


@app.route("/upload", methods=["POST"])
def upload_image():

    if "image" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No image uploaded"
        }), 400

    image = request.files["image"]

    if image.filename == "":
        return jsonify({
            "status": "error",
            "message": "No image selected"
        }), 400

    filepath = os.path.join(UPLOAD_FOLDER, image.filename)

    image.save(filepath)

    return jsonify({
        "status": "success",
        "message": "Image uploaded successfully",
        "filename": image.filename
    })


if __name__ == "__main__":
    app.run(debug=True)