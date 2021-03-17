import os
import json


class TrainManager(object):
    def __init__(self) -> None:
        print("Initializing route Class..")
        self.all_routes = TrainManager.load_all_routes()
        self.unieuq_stations = "xd"

    @classmethod
    def load_all_routes(cls) -> list:
        """Get a list of all available routes"""
        all_routes = []
        for file in os.listdir('routes/'):
            with open(f"routes/{file}", "r", encoding="utf-8") as f:
                all_routes.append(json.load(f))
        return all_routes

    def get_unique_stations(self):
        """Returns a list of all only unique stations from routes excluding the last one"""
        unique_stations = []
        for route in self.all_routes:
            # We want to make a list of all unique stations EXCEPT the very last one on every route
            for station in route["_stations"][:-1]:
                if station not in unique_stations:
                    unique_stations.append(station)
        return unique_stations

    def get_following_stations(self, start_st: str):
        """Return list of stations that have a connection with the starting staton"""
        connected_stations = []
        for route in self.all_routes:
            # sr = station route
            sr = route["_stations"]
            if start_st in sr:
                for station in sr:
                    if sr.index(start_st) < sr.index(station):
                        connected_stations.append(station)
        return connected_stations

    def get_route__with_stations(self, start_station: str, end_station: str) -> list:
        #  The starting station and ending station of the route
        filtered_routes = []
        for route in self.all_routes:
            station_array = route["_stations"]
            if start_station in station_array and end_station in station_array:
                if station_array.index(start_station) < station_array.index(end_station):
                    route = {
                        "route_id":route["_route_id"],
                        "route_origin":station_array[0],
                        "route_destination":station_array[-1],
                        "arrives_at_starting":route["_arrives"][station_array.index(start_station)],
                        "arrives_at_ending":route["_arrives"][station_array.index(end_station)]
                    }
                    filtered_routes.append(route)
        print(filtered_routes[0]["route_id"])
        return filtered_routes 
        
            
    # def get_routes_with_station(self, start_st: str):
    #     """Function return list of all routes that pass the filter: filter1 > filter2"""
    #     candidate_routes = []
    #     for route in self.all_routes:
    #         # sr = station route
    #         sr = route["_stations"]

    #         # Check if end_station has been given.
    #         if end_st:
    #             if start_st in sr and end_st in sr:
    #                 if sr.index(start_st) < sr.index(end_st):
    #                     candidate_routes.append(sr)
    #         # Else return all routes that have the station1 in them
    #         else:
    #             if start_st in sr:
    #                 candidate_routes.append(sr)
    #     if candidate_routes:
    #         return candidate_routes
    #     else:
    #         print(f"{start_st} Station has no routes:ERROR")
    #         if end_st:
    #             print(end_st)
    #         return None

