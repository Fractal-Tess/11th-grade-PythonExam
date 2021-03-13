import os
import json


class TClient(object):
    def __init__(self) -> None:
        print("Initializing route Class..")
        self.all_routes = TClient.load_all_routes()
    

    @classmethod
    def load_all_routes(cls):
        all_routes = []
        for file in os.listdir('routes/'):
            with open (f"routes/{file}", "r", encoding="utf-8") as f:
                all_routes.append(json.load(f))
        return all_routes



    def route_beginings(self) -> list:
        """Returns a list of all only unique stations from routes excluding the last one"""
        route_beginings_list = []
        for route in self.all_routes:
            for station in route["_stations"]:
                if station not in route_beginings_list:
                    route_beginings_list.append(station)
        return route_beginings_list


    def filter_routes(self, station1:str, station2:str = None) -> list or None:
        """Function return list of all routes that pass the filter: filter1 > filter2"""
        for route in self.all_routes:
            # sr = station rotue
            sr = route["_stations"]
            if station2:
                if station1 in sr and station2 in sr:
                    if sr.index(station1) < sr.index(station2): return route
            else:
                if station1 in sr:
                    return route
            

        return None

# y = "РУСЕ"
# z = "БЯЛА"
# x = TClient()
# # print(x.filtered_routes(y,z))
# print(x.route_beginings())
