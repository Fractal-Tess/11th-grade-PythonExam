import { ticket, showInfo } from "./index"

const routeSelector = document.getElementById("selectElmt")! as HTMLSelectElement

export class RoutePicker{
    routesObjectArray:object[];
    selectedRouteName:string;
    selectedRouteObject:object;
    selectElmt:HTMLSelectElement;
    //@ts-ignore
    constructor(selectElmt:HTMLSelectElement){
        this.routesObjectArray = [];
        this.selectedRouteName = "";
        this.selectedRouteObject = {};
        this.selectElmt = selectElmt;
        this.selectElmt.value ="";

        this.selectElmt.addEventListener("change", (e)=>{
            this.selectedRouteName = this.selectElmt.value;
            this.setSelectedRoute(this.selectedRouteName)
            //@ts-ignore
            ticket.setPriceForPassenger(this.selectedRouteObject["ticket_price"])
            ticket.setRouteName(this.selectedRouteName)
            ticket.setRouteObject(this.selectedRouteObject)
            ticket.recalculate()
            ticket.setTimers(
                //@ts-ignore
                this.selectedRouteObject["arrives_at_starting_station_time"],
                //@ts-ignore
                this.selectedRouteObject["departs_from_starting_station_time"],
                //@ts-ignore
                this.selectedRouteObject["arrives_at_ending_station_time"],
                //@ts-ignore
                this.selectedRouteObject["departs_from_ending_station_time"],
            )
            showInfo();
        })

    }
    setRouteArray(arr:object[]):void{
        this.routesObjectArray = arr;
        for(let i = 0; i < arr.length; i++){
            let a = document.createElement("option");
            a.setAttribute("type", "text");
            //@ts-ignore
            a.textContent = arr[i]["route_name"];
            //@ts-ignore
            a.value = arr[i]["route_name"];
            this.selectElmt.appendChild(a);
            // @ts-ignore
        }
        this.selectElmt.value = ""
    }
    clearRouteArray():void{
        while(this.selectElmt.firstChild){
            this.selectElmt.removeChild(this.selectElmt.firstChild);
            this.selectedRouteName = "";
            this.routesObjectArray = [];
            this.selectedRouteObject = {};
            this.selectElmt.value ="";
        }
    }

    private setSelectedRoute(routeName:string):void{
        for(let i=0; i< this.routesObjectArray.length;i++){
            // @ts-ignore
            if (this.routesObjectArray[i]["route_name"] === routeName) {
                this.selectedRouteObject = this.routesObjectArray[i]
            }
        }
    }
}
export const routePicker = new RoutePicker(routeSelector)
