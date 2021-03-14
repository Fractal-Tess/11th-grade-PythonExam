from TrainManager import TrainManager
from flask import Flask, render_template, request, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import os
from TrainManager import TrainManager as TM 
from json import dumps
import uuid



# CONSTANTS
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
HOST = "0.0.0.0"
PORT = 80

# GlOBALS
socketio = SocketIO(app, cors_allowed_origins="*")
tm = TM()
db = SQLAlchemy(app)
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///market.db '

# class Item(db.Model):
#     id = db.Column(db.Integer(), primary_key=True)
#     name = db.Column(db.String(length=30), nullable=False)

#     def __repr__(self):
#         return f"Item {self.name}


def ack():
    print("Message recieved")


@app.route('/')
def index_page():
    return render_template('index.html')


# @socketio.on("connect")
# def connected():
#     print("\n\n\tA user has connected\n\n")


# @socketio.on("disconnect")
# def disconnected():
#     print("\n\n\t A user has disconnected\n\n")


# gus => get_unique_stations
# s_gus => server response to get_unique_stations
@socketio.on('gus')
def gus():
    print(tm.get_unique_stations())
    socketio.emit("s_gus", tm.get_unique_stations(), callback=ack)

# grws = get routes with starting station
@socketio.on('grwst')
def grwus(data):
    socketio.emit("s_grwst", tm.get_following_stations(data), callback=ack)

# get routes with starting and ending station
@socketio.on('grwsnes')
def grwus(starting_station, end_station):
    socketio.emit("s_grwsnes", tm.get_route__with_stations(starting_station, end_station), callback=ack)

@socketio.on("book_ticket")
def book_ticket(ticketDict):
    ticket_count = len(os.listdir('tickets/'))
    ticketDict["uid"] = str(uuid.uuid1())
    with open(f"tickets/ticket_{ticket_count}.json", "w", encoding="utf-8") as f:
        f.write(dumps(ticketDict, ensure_ascii=False))
        f.close()
    socketio.emit("s_book_ticket_response", {"uid":ticketDict["uid"]})

if __name__ == '__main__':
    if not os.path.exists("market.db"):
        print("Did not find a databse: Creating a new one....")
        db.create_all()
    socketio.run(app, port=PORT, debug=True, host=HOST, log=None)
    