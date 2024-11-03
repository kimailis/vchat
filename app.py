from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

DATABASE = 'messages.db'

# Connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize the database and create the necessary tables
def init_db():
    conn = get_db_connection()
    with conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue TEXT NOT NULL,
                message TEXT NOT NULL
            );
        ''')
    conn.close()

# Route to get all unique queues
@app.route('/api/queues', methods=['GET'])
def get_all_queues():
    try:
        conn = get_db_connection()
        print("Executing query: SELECT DISTINCT queue FROM messages")
        queues = conn.execute('SELECT DISTINCT queue FROM messages').fetchall()
        conn.close()

        queue_names = [queue['queue'] for queue in queues]
        return jsonify(queue_names), 200
    except Exception as e:
        print(f"Error fetching queues: {e}")
        return jsonify({'error': 'Could not load queues'}), 500

# Route to add a message to a specific queue
@app.route('/api/<string:queue_name>', methods=['POST'])
def add_message(queue_name):
    try:
        message_data = request.get_json()
        content = message_data.get('content')

        if not content:
            return jsonify({'error': 'Message content is required'}), 400

        conn = get_db_connection()
        conn.execute('INSERT INTO messages (queue, message) VALUES (?, ?)', (queue_name, content))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Message added successfully'}), 201
    except Exception as e:
        print(f"Error adding message to queue {queue_name}: {e}")
        return jsonify({'error': 'Failed to add message'}), 500
    
# New route to get messages for a specific queue
@app.route('/api/<string:queue_name>', methods=['GET'])
def get_queue_messages(queue_name):
    try:
        conn = get_db_connection()
        messages = conn.execute('SELECT message FROM messages WHERE queue = ?', (queue_name,)).fetchall()
        conn.close()
        
        # Return messages as a list
        return jsonify([message['message'] for message in messages]), 200
    except Exception as e:
        print(f"Error fetching messages for queue {queue_name}: {e}")
        return jsonify({'error': 'Failed to fetch messages'}), 500


# Route to render the main index.html page
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    init_db()  # Initialize the database when the server starts
    app.run(host='0.0.0.0', port=80, debug=True)
