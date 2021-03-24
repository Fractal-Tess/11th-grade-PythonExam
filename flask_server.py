from re import X
from flask import render_template
from flask_app import app
from flask_socketio import SocketIO
import uuid
from datetime import date
from flask_database import Route_nodes, Routes, Tickets, Unique_stations, db

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

@app.route('/check-ticket')
def check_ticket():
    return render_template("check_for_ticket.html")

@app.route('/day-statistics')
def day_statistics():
    today = date.today().strftime("%d/%m/%Y")
    print(today)
    ticket_count = len(Tickets.query.filter_by(date=today).all())
    return render_template('daystatistics.html', ticket_count=ticket_count)

@app.route('/new-ticket/<uid>')
def created_new_ticket(uid):
    if Tickets.query.filter_by(ticket_number=uid).first():
        return render_template('made_new_ticket.html', uid = uid)
    else:
        page_not_found(404)

@app.errorhandler(404)
def page_not_found(e):
    """404 Error handler"""
    # note that we set the 404 status explicitly
    return render_template('404.html'), 404

@socketio.on("get-all-ticket-numbers")
def get_all_ticket_nubers():
    list_of_tickets_numbers = [ticket.ticket_number for ticket in Tickets.query.all()]
    socketio.emit("server-get-all-ticket-numbers", list_of_tickets_numbers)
@socketio.on("get-ticket-data")
def get_ticket_data(uid):
    ticket = Tickets.query.filter_by(ticket_number=uid).first()
    data = {
        'route_name':ticket.route,
        'startStation':ticket.startStation,
        'destination':ticket.destination,
        'arrives_at_starting':ticket.arrives_at_starting,
        'arrives_at_destination': ticket.arrives_at_destination,
        'adult_passengers':ticket.adult_passengers,
        'kid_passengers':ticket.kid_passengers,
        'ticket_price':ticket.ticket_price,
        'date':ticket.date,
    }
    socketio.emit("server-ticket-data-response", data)
    
    

@socketio.on("server-gateway")
def endpoint(data):
    if data["opcode"] == "get_unique_station_names":
        socketio.emit("server-get-unique-response", [x.station_name for x in (Unique_stations.query.all())])

    elif data["opcode"] == "get_connected_stations":
        st = data["starting_station"]
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
    
        
    elif data["opcode"] == "get_routes_with_stations":
        applicable_routes = []
        starting_station = Unique_stations.query.filter_by(station_name=data["starting_station"]).first()
        ending_station = Unique_stations.query.filter_by(station_name=data["ending_station"]).first()
        starting_station_nodes = starting_station.nodes
        ending_station_nodes = ending_station.nodes
        for st_node in starting_station_nodes:
            for end_node in ending_station_nodes:
                if end_node.route == st_node.route:
                    if st_node.node_in_route < end_node.node_in_route:
                        applicable_routes.append({
                            "route_name":st_node.route.route_name,
                            "arrives_at_starting_station_time":st_node.arriveTime,
                            "departs_from_starting_station_time":st_node.departTime,
                            "arrives_at_ending_station_time":end_node.arriveTime,
                            "departs_from_ending_station_time":end_node.departTime,
                            "ticket_price":(end_node.node_in_route - st_node.node_in_route) * float(st_node.route.tppsh)
                        })
        socketio.emit("server-get-routes-with-stations", applicable_routes)
    elif data["opcode"] == "book_ticket":
        ticket_uid = str(uuid.uuid1())
        while Tickets.query.filter_by(ticket_number = ticket_uid).first():
            print("This number is already in the database")
            ticket_uid = uuid.uuid1() 

        route_name = data["ticket"]['routeName']
        starting_station = data["ticket"]["startingStation"]
        destination = data["ticket"]["destinationStation"]
        

        adult_count = data["ticket"]['adultCount']
        kids_count = data["ticket"]['kidsCount']
        ticket_price = data["ticket"]['ticketPrice']
        date = data["ticket"]['date']

        arrives_at_starting = data["ticket"]["routeObject"]["arrives_at_starting_station_time"]
        arrives_at_destination = data["ticket"]["routeObject"]["arrives_at_ending_station_time"]

        ticket = Tickets(ticket_number = ticket_uid,route=route_name, startStation=starting_station,
        destination=destination,arrives_at_starting = arrives_at_starting,
        arrives_at_destination= arrives_at_destination, adult_passengers = adult_count, 
        kid_passengers = kids_count, ticket_price = ticket_price, date = date)
        db.session.add(ticket)   
        db.session.commit()
        socketio.emit("server-ticket-response", ticket_uid)

        



if __name__ == '__main__':
    socketio.run(app, port=PORT, debug=True, host=HOST)
    