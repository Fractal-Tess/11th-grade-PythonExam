from re import X
from flask import render_template
from flask_app import app
from flask_socketio import SocketIO
from flask_databse import Route_nodes, Routes, Unique_stations, db
# Flask return text/plain mim types... This does nothing.
# Fix was reg monkey patch.
import mimetypes
mimetypes.guess_type("notExists.js")
('text/javascript', None)

# CONSTANTS
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SECRET_KEY'] = 'secret!' # necessary for socketio
HOST = "0.0.0.0"
PORT = 80

@app.route('/')
def index():
    return render_template("index.html", title="Home")
    
@app.route('/new-ticket')
def new_ticket():
    return render_template("new_ticket.html" , title="New-Ticket")


@app.errorhandler(404)
def page_not_found(e):
    """404 Error handler"""
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404


@socketio.on("server-gateway")
def endpoint(data):
    if data["opcode"] == "get_unique_station_names":
        socketio.emit("server-get-unique-response", [x.station_name for x in (Unique_stations.query.all())])

    elif data["opcode"] == "get_connected_stations":
        st = data["station_name"]
        station = Unique_stations.query.filter_by(station_name=st).first()
        station_list = list()
        for route in [node.route for node in station.nodes]:
            station_index_in_route = 0
            for node in route.nodes:
                if node.station.station_name == st:
                    station_index_in_route = node.node_in_route
                    break
            for node in route.nodes:
                if node.node_in_route > station_index_in_route:
                    if node.station.station_name not in station_list:
                        station_list.append(node.station.station_name)
        socketio.emit("server-get-stations-linked-to-station", station_list)
        print("Link was requested")

if __name__ == '__main__':
    socketio.run(app, port=PORT, debug=True, host=HOST)
    