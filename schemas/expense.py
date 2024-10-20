from marshmallow import Schema, fields, validate, validates_schema, ValidationError, post_load, pre_dump
from datetime import datetime

class ExpenseSchema(Schema):
    _id = fields.Str(dump_only=True)
    payer_id = fields.Str(dump_only=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    description = fields.Str(required=True)
    participants = fields.List(fields.Str(), required=True)
    split_method = fields.Str(required=True, validate=validate.OneOf(['equal', 'exact', 'percentage']))
    split_details = fields.Dict(keys=fields.Str(), values=fields.Float())
    date = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_split_details(self, data, **kwargs):
        if data['split_method'] == 'equal':
            if data.get('split_details'):
                raise ValidationError("Split details should be empty for equal split")
        elif data['split_method'] in ['exact', 'percentage']:
            if not data.get('split_details') or len(data['split_details']) != len(data['participants']):
                raise ValidationError("Split details must be provided for all participants")
            
            if data['split_method'] == 'percentage':
                total_percentage = sum(data['split_details'].values())
                #remove the payer from the split details
                # total_percentage -= data['split_details'].get(data['payer_id'], 0)
                if abs(total_percentage - 100) > 0.01:
                    raise ValidationError("Total of percentages must equal 100%")
            elif data['split_method'] == 'exact':
                total_amount = sum(data['split_details'].values())
                if abs(total_amount - data['amount']) > 0.01:
                    raise ValidationError("Total of split amounts must equal the expense amount")

    @post_load
    def make_expense(self, data, **kwargs):
        if 'date' in data and isinstance(data['date'], str):
            data['date'] = datetime.fromisoformat(data['date'])
        return data

    @pre_dump
    def prepare_dump(self, data, **kwargs):
        if hasattr(data, 'json'):
            data = data.json()
        if 'split_details' in data and 'payer_id' in data:
            data['split_details'] = {k: v for k, v in data['split_details'].items() if k != data['payer_id']}
        if 'date' in data and isinstance(data['date'], str):
            data['date'] = datetime.fromisoformat(data['date'])
        return data