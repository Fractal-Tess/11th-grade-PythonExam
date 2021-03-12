import os
import json


class TClient(object):
    def __init__(self) -> None:
        self.all_routes = TClient.load_all_routes()
    

    @classmethod
    def load_all_routes(cls):
        all_routes = []
        for file in os.listdir('routes/'):
            with open (f"routes/{file}", "r", encoding="utf-8") as f:
                all_routes.append(json.load(f))
        return all_routes

    def filter(self,st1) -> list:
        for station_route in self.all_routes:
            if st1 in station_route["_stations"]:
                return station_route
        return None
        
    def filtered_routes(self, filter1, filter2=None):
        """Function return list of all routes that pass the filter: filter1 > filter2"""
        for route in self.all_routes:
            # sr = station rotue
            sr = route["_stations"]
            if filter2:
                if filter1 in sr and filter2 in sr:
                    if sr.index(filter1) < sr.index(filter2): return route
            else:
                if filter1 in sr:
                    return route
            

        return None

y = "РУСЕ"
z = "БЯЛА"
x = TClient()
print(x.filtered_routes(y,z))
