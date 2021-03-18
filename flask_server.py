from flask import render_template
from flask_app import app
from flask_socketio import SocketIO
from flask_databse import Route_nodes, Routes, Unique_stations, db

# CONSTANTS
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

@socketio.on("server-gateway")
def endpoint(data):
    if data["opcode"] == "get_unique_station_names":
        socketio.emit("server-get-unique-response", [x.station_name for x in (Unique_stations.query.all())])


if __name__ == '__main__':
    socketio.run(app, port=PORT, debug=True, host=HOST)
    