from flask import Flask, render_template, request, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import os
import ticket_module

# CONSTANTS
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
HOST = "0.0.0.0"
PORT = 80

# GlOBALS
socketio = SocketIO(app, cors_allowed_origins="*")
tc = ticket_module.TClient()
db = SQLAlchemy(app)
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///market.db '

# class Item(db.Model):
#     id = db.Column(db.Integer(), primary_key=True)
#     name = db.Column(db.String(length=30), nullable=False)

#     def __repr__(self):
#         return f"Item {self.name}"

@app.route('/')
def index_page():
    return render_template('index.html')

def ack():
    print("Message was recived!")
    
@socketio.on("message")
def handle_message(msg):
    print(msg)


@socketio.on('get_all_routes')
def my_event():
    print("Routes were requested")
    socketio.emit("all_routes", tc.route_beginings())

if __name__ == '__main__':
    if not os.path.exists("market.db"):
        print("Did not find a databse: Creating a new one....")
        db.create_all()
    socketio.run(app, port=PORT, debug=True, host=HOST)
    