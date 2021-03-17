from flask_sqlalchemy import SQLAlchemy
from flask import Flask

db_name = "routes.db"
path_to_db = "../database/"
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{path_to_db}{db_name}"
db = SQLAlchemy(app)

class Unique_stations(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    station_name = db.Column(db.String(length=30), nullable=False, unique=True)
    nodes = db.relationship("Route_nodes", backref="station")
    # def __repr__(self):
    #     return "Unique_stations(station_name='%s')" % self.station_name

class Routes(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    nodes = db.relationship("Route_nodes", backref="route")
    # Usually the route name would be the first an very last staton of a route
    route_name = db.Column(db.String(length=30), nullable=False)

    # Ticket price per station hop = > tppsh
    tppsh = db.Column(db.Float(), nullable=False)
    # ~~~ADDITIONAL~~~~

    # Classes
    firstC_seats_avilable = db.Column(db.Integer())
    firstC_seats_price_multiplier = db.Column(db.Float())
    secondC_seats_available = db.Column(db.Integer())
    secondC_seats_price_multiplier = db.Column(db.Float())
    economyC_seats_available = db.Column(db.Integer())
    economyC_seats_price_multiplier = db.Column(db.Float())

    # Cargo We measure cargo in kg and in m^3
    can_carry_cargo = db.Column(db.Boolean())
    cargo_capacity_kg = db.Column(db.Integer())
    cargo_capacity_volume = db.Column(db.Integer())
    price_per_kg = db.Column(db.Float())
    price_per_m3 = db.Column(db.Float())
    
    # Indicates weather or not this route is operational
    is_operational = db.Column(db.Boolean())
    # Show whether or not this route has finished for today.
    route_is_completed = db.Column(db.Boolean())

class Route_nodes(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    # Indicates of which ROUTE this node belongs to
    route_id = db.Column(db.Integer(), db.ForeignKey("routes.id"))
    # Show which station 
    station_id = db.Column(db.Integer, db.ForeignKey("unique_stations.id"))

    # Indicates which node in the route this is 
    # For example: it would be 0 if this was the very first departure staton
    # or it would be the 4 of this was the 5th station in the route
    node_in_route =  db.Column(db.Integer())
    # Self explenatory: but basically shows when the train reaches and and leaves "this" node.
    # I could also use the DateTime object here .. but it would require a lot more code that cna be avoided
    arriveTime = db.Column(db.String(length=10))
    departTime = db.Column(db.String(length=10))

