# Order Management System

A Flask-based order management system with PostgreSQL database storage and CSV import capabilities.

## Features

- Database management of order information
- Display of order list with sorting and filtering
- Real-time customer search functionality
- Add/Edit orders through modal interface
- Bulk import of order information from CSV files
- Dark-themed responsive UI

## Tech Stack

- Backend: Flask, PostgreSQL
- Frontend: HTML/CSS/JS, Bootstrap
- Features: CSV Import/Export, Data Validation, Real-time Updates

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   - DATABASE_URL: PostgreSQL connection string
   - FLASK_SECRET_KEY: Secret key for Flask session

4. Run the application:
   ```bash
   python main.py
   ```

## CSV Import Format

The CSV file should have the following format:
- Headers: Customer, Amount
- Data rows: customer name, numeric amount

## License

MIT
