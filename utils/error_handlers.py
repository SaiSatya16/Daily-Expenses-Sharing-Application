from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({"message": "Validation error", "errors": error.messages}), 400

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify({"message": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        return jsonify({"message": "An unexpected error occurred"}), 500