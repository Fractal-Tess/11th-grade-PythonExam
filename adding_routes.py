import os
from datetime import datetime, timedelta
import json

# Clear screen
os.system('cls' if os.name == 'nt' else 'clear')

# Give some form of context
print("You can begin to pase raw routes copied from https://radar.bdz.bg/bg\nType `end` to quit.")

# Begin endless whileloop until interupted by 'end'
while (raw_route_info := input("\n>>>").strip()) != "end":

    # Check for input errors
    if raw_route_info == "": 
        print("Input was empty. Skiping...")
        continue
    elif len(raw_route_info) < 30:
        print("Typo? Skipping...")
        continue

    print("\nAdding a new route!")
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

    # Ensure that departure time != arival time    
    for i in range(len(departs)):
        ar = datetime.strptime(arrives[i], "%H:%M")
        de = datetime.strptime(departs[i], "%H:%M")
        if (de - ar).total_seconds()/ 60 < 1:
            de += timedelta(0,0, minutes=1)
        arrives[i] = str(ar.time())[:-3]
        departs[i] = str(de.time())[:-3]


    # date = datetime.strptime(arrives[0], "%H:%M")
    # print(str(date.time())[:-3])
    # date += timedelta(0,0, minutes=71)
    # print(str(date.time())[:-3])                    

    # odd, even = [num1, num2 for num1, num2 in zip(lst[1::2], lst[::2])]
    
    d_route = {
        "_stations": stations,
        "_arrives": arrives,
        "_depars": departs
    }

    file_count = len(os.listdir("routes/"))
    with open(f"routes/route_{file_count}.json", "w+", encoding='utf-8') as f:
        data = json.dumps(d_route, ensure_ascii=False)
        f.write(data)
    print("\nCreation of the new route was successful!")
    # print(type(stations))
    # print(stations)
    # print(f"arrives is ::{arrives}")
    # print(f"departs is ::{departs}")