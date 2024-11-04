from flask import Flask, request, jsonify, render_template
import sqlite3
from pathlib import Path

app = Flask(__name__)

# Database configuration
DATABASE = Path('instance/messages.db')
DATABASE.parent.mkdir(exist_ok=True)

def get_db_connection():
    """Create a database connection with row factory"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
    finally:
        conn.close()

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/api/queues', methods=['GET'])
def get_all_queues():
    """Retrieve all unique queue names"""
    try:
        conn = get_db_connection()
        queues = conn.execute('SELECT DISTINCT queue FROM messages ORDER BY queue').fetchall()
        conn.close()
        return jsonify([queue['queue'] for queue in queues])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/<string:queue_name>', methods=['GET'])
def get_queue_messages(queue_name):
    """Retrieve all messages for a specific queue"""
    try:
        conn = get_db_connection()
        messages = conn.execute(
            'SELECT message FROM messages WHERE queue = ? ORDER BY created_at DESC',
            (queue_name,)
        ).fetchall()
        conn.close()
        return jsonify([message['message'] for message in messages])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/<string:queue_name>', methods=['POST'])
def add_message(queue_name):
    """Add a new message to a specific queue"""
    try:
        message_data = request.get_json()
        
        if not message_data or 'content' not in message_data:
            return jsonify({'error': 'Message content is required'}), 400
        
        content = message_data['content']
        if not content.strip():
            return jsonify({'error': 'Message content cannot be empty'}), 400

        conn = get_db_connection()
        conn.execute(
            'INSERT INTO messages (queue, message) VALUES (?, ?)',
            (queue_name, content)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Message added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    init_db()  # Initialize the database before starting the server
    app.run(debug=True, port='80', host='0.0.0.0')