import csv
import io
from decimal import Decimal
from flask import render_template, request, jsonify, flash
from app import app, db
from models import Order

@app.route('/')
def index():
    return render_template('orders.html')

@app.route('/api/orders')
def get_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders])

@app.route('/api/orders', methods=['POST'])
def add_order():
    data = request.json
    try:
        amount = Decimal(str(data['amount']))
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
            
        order = Order(
            customer=data['customer'].strip(),
            amount=amount
        )
        db.session.add(order)
        db.session.commit()
        return jsonify(order.to_dict())
    except (ValueError, KeyError) as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/import-csv', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be CSV format'}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"))
        csv_reader = csv.DictReader(stream)
        
        if not {'Customer', 'Amount'}.issubset(csv_reader.fieldnames):
            return jsonify({'error': 'CSV must have Customer and Amount columns'}), 400

        orders_added = 0
        for row in csv_reader:
            try:
                amount = Decimal(str(row['Amount']))
                if amount <= 0:
                    continue

                order = Order(
                    customer=row['Customer'].strip(),
                    amount=amount
                )
                db.session.add(order)
                orders_added += 1
            except (ValueError, KeyError):
                continue

        db.session.commit()
        return jsonify({'message': f'Successfully imported {orders_added} orders'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
