from  os import system, path, name, mkdir
from sys import exit
from db_model import db_name, db, Routes, Unique_stations, Route_nodes, path_to_db
from datetime import datetime, timedelta
import random


def missing_db():
    print("Databse does not exist")
    u_in = input("Create a new one? [y/n]: ").lower()
    if  u_in== "n":
        system("pause")
        exit(0)
    elif u_in == "y":
        if not path.exists(path_to_db):
            mkdir(path_to_db)
        db.create_all()
        if(check_for_db()):
            print("Successfully created databse...")
            return
        else:
            raise Exception("Unable to create new databse")
    else:
        print("Input is incorrect fromat: Recursing...\n")
        missing_db()


def check_for_db():
    if not path.exists(f"{path_to_db}{db_name}"):
        missing_db()
    else:
        return True
check_for_db()

unique_statons = [x.station_name for x in Unique_stations.query.all()]
system("pause")
system('cls' if name == 'nt' else 'clear')
print("You can begin to pase raw routes copied from https://radar.bdz.bg/bg\nType `end` to quit.")
while (raw_route_info := input("\n>>>").strip()) != "end":
    

    if len(raw_route_info) < 30:
        print("Typo? Skipping...")
        continue
        
    print("\nAttempting to create a new route...")
    timers = []
    stations = []
    route_info_arr = raw_route_info.split(" ")
    i = 0
    last_is_timer = True
    for element in route_info_arr:
        try:
            int(element[0])
            timers.append(element)
            if last_is_timer:
                continue
            last_is_timer = True
            i += 1
        except:
            if not last_is_timer:
                stations[i] += " " + element
                continue
            stations.append(element)
            last_is_timer = False

    # Remove annoying symbols
    stations[0] = stations[0][0:-2:1]
    stations.pop()

    # Fix missing timers
    arrives, departs  = [timers[1::2], timers[::2]]
    arrives.insert(0, departs[0])
    departs.insert(len(departs), arrives[-1])

    # Ensure that departure time != arrival time    
    for i in range(len(departs)):
        ar = datetime.strptime(arrives[i], "%H:%M")
        de = datetime.strptime(departs[i], "%H:%M")
        if (de - ar).total_seconds()/ 60 < 1:
            de += timedelta(0,0, minutes=1)
        arrives[i] = str(ar.time())[:-3]
        departs[i] = str(de.time())[:-3]


    # Make all stations capitalized
    for i in range(len(stations)):
        stations[i] = stations[i].capitalize()

    if Routes.query.filter_by(route_name=f"{stations[0]}>{stations[-1]}").first():
        print("This route already exists...Skipping")
        continue
    random_price = round(random.uniform(1 ,1.90) ,1)
    db_route = Routes(route_name=f"{stations[0]}>{stations[-1]}", tppsh=random_price)
    db.session.add(db_route)

    new_unique_stations = []
    # Start logging them into the database
    for station in stations:
        if station not in unique_statons:
                new_unique_stations.append(station)
                db.session.add(Unique_stations(station_name=station))
    unique_statons += new_unique_stations

    for index, station in enumerate(stations):
        station_query = Unique_stations.query.filter_by(station_name=station).all()
        # If 'all()' returns a list we have a huge problem.
        if len(station_query) > 1:
            print("Error on line 93, type is list (KMS)")
            system("pause")
            exit(0)
        route_node = Route_nodes(route=db_route, station=station_query[0], node_in_route=index,
                                arriveTime=arrives[index], departTime=departs[index])
        db.session.add(route_node)
    db.session.commit()
    print("\nCreation of the new route was successful!")
