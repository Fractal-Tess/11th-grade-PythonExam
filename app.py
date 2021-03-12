from operator import length_hint
from flask import Flask, render_template, request 
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
# import ticket_module
import os
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///market.db '
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# class Item(db.Model):
#     id = db.Column(db.Integer(), primary_key=True)
#     name = db.Column(db.String(length=30), nullable=False)

#     def __repr__(self):
#         return f"Item {self.name}"

@app.route('/')
def index_page():
    return render_template('index.html')



if __name__ == '__main__':
    if not os.path.exists("market.db"):
        print("Did not find a databse: Creating a new one....")
        db.create_all()
    socketio.run(port=8000, debug=True, host='192.168.0.2')
    