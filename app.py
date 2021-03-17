from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

# CONSTANTS
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SECRET_KEY'] = 'secret!'
HOST = "0.0.0.0"
PORT = 80


@app.route('/')
def index():
    return render_template("index.html", title="Home")
    
@app.route('/new-ticket')
def new_ticket():
    return render_template("new_ticket.html" , title="New-Ticket")



if __name__ == '__main__':
    socketio.run(app, port=PORT, debug=True, host=HOST, log=None)
    