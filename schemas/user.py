from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    _id = fields.Str(dump_only=True)
    email = fields.Email(required=True)
    name = fields.Str(required=True, validate=validate.Length(min=1))
    mobile = fields.Str(required=True, validate=validate.Length(min=10, max=15))
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)