// Socket Io
const socket = require('socket.io-client')();
const datePicker = require("./date_picker")
// const _ = require("./passenger_manager")
// import { PassengerManager } from "./passenger_manager"
const _ = require("./passenger_manager")
import { capitalizeFirstLetter } from "./helper"
import  { routePicker } from "./route_picker"



// Autocomplete suggestions
const suggestions_amount = 4;
const kids_ticket_discount = .35;

// Input fields
const starting_station_input_field = document.getElementById('sStation')! as HTMLInputElement
const ending_station_input_field = document.getElementById('eStation')! as HTMLInputElement
var starting_station_verified = false;
var ending_station_verified = false;


// Checkers
const sStation_checker = document.getElementById("ch1")! as HTMLDivElement
const eStation_checker = document.getElementById("ch2")! as HTMLDivElement

sStation_checker.style.display = "none";
eStation_checker.style.display = "none";

//Buy ticket btn
const buyTicketBtn = document.getElementById("buy_btn")! as HTMLButtonElement

// Labels
const l_route = document.getElementById("l_route")!as HTMLLabelElement
const l_from = document.getElementById('l_from')! as HTMLLabelElement
const l_to = document.getElementById('l_to')!as HTMLLabelElement
const l_when_to_board = document.getElementById('l_when_board')!as HTMLLabelElement
const l_get_off = document.getElementById('l_get_off')!as HTMLLabelElement
const l_ticket_price = document.getElementById('l_ticket_price')! as HTMLLabelElement


//Init an empty list that will hold ALL UNIQUE stations
const uniqueStations:string[] = [];
var linkedStation:string[]  = []
var routes_from_linked:object[] = []


function requestData(opCode:string, startingStation:string = "", endStation:string=""){
  socket.emit("server-gateway", {opcode:opCode, starting_station:startingStation, ending_station: endStation})
}


// On established connection
socket.on("connect", () =>{
    console.log("Connected with SocketIO")
})


// Request unique stations
requestData("get_unique_station_names");

// listen to server responses
socket.on("server-get-unique-response", (data:string[]) =>{
    data.forEach(stationName => {
        uniqueStations.push(stationName)
    });
  //Enable the autocomplete for Starting station
  autocomplete(starting_station_input_field, uniqueStations, sStation_checker)
})

socket.on("server-ticket-response", (data:string)=>{
  location.href = '/new-ticket/'+data;
})



function clearInfo(){
  ticket.isDisplayed = false;

  l_route.innerText = ""
  l_from.innerText = ""
  l_to.innerText = ""
  l_get_off.innerText = ""
  l_when_to_board.innerText = ""
  l_ticket_price.innerText = ""

  //Anytime we write anything in the input field, we clear the train route
  routePicker.clearRouteArray();
}

export function showInfo(){
  ticket.isDisplayed = true;

  l_route.innerText = "Route :" + ticket.routeName;
  l_from.innerText = "Starting Station: " + ticket.startingStation;
  l_to.innerText = "End station:" + ticket.destinationStation;
  l_when_to_board.innerText = "You should board the train at Station: " +
  ticket.startingStation + " at :"+ ticket.arrivesAtStarting;
  l_get_off.innerText = "You should get off from  the train at Station: " +
  ticket.destinationStation + " at :"+ ticket.arrivesAtDestination;
  if (ticket.kidsCount >= 1){
    l_ticket_price.innerText = "Ticker price for " +  ticket.adultCount + " Adult(s) + " + 
    ticket.kidsCount+" Kid(s) is :" + ticket.ticketPrice  +" Leva "
  }
  else l_ticket_price.innerText = "Ticket for " + ticket.adultCount + " Adult(s) is :" + ticket.ticketPrice +" Leva"
}
class Ticket{
  adultCount:number;
  kidsCount:number;
  ticketPrice:number;
  routeTicketPrice:number;

  
  routeName:string;
  routeObject:object

  startingStation:string;
  destinationStation:string

  arrivesAtStarting:string;
  departsFromStarting:string;
  arrivesAtDestination:string;
  departsFromDestination:string;
  
  isDisplayed:boolean;

  date:string;


  constructor(){
  this.adultCount = 1;
  this.kidsCount = 0;
  this.ticketPrice = 0;
  this.routeTicketPrice = 0;
  
  
  this.routeName = "";
  this.routeObject = {}

  this.startingStation =""
  this.destinationStation = ""

  this.arrivesAtStarting =  ""
  this.departsFromStarting =  ""
  this.arrivesAtDestination = ""
  this.departsFromDestination =  ""
  this.date =""

  this.isDisplayed = false;
  }
  setKids(kids:number){
    this.kidsCount = kids;
    this.recalculate()
  }
  setAdults(adults:number){
    this.adultCount = adults;
    this.recalculate()
    return 1;
  }
  setPriceForPassenger(ticketPrice:number){
    this.routeTicketPrice = ticketPrice
  }

  setRouteName(routeName:string):void{
    this.routeName = routeName;
  }
  setRouteObject(obj:object):void{
    this.routeObject = obj;
  }
  setTimers(aas:string, dfs:string, aad:string, dfd:string){
  this.arrivesAtStarting =  aas;
  this.departsFromStarting = dfs;
  this.arrivesAtDestination = aad;
  this.departsFromDestination = dfd;
  }

  recalculate(){
    this.ticketPrice = Math.round((this.adultCount * this.routeTicketPrice +  this.kidsCount * this.routeTicketPrice * kids_ticket_discount) * 100)/100
    if(this.isDisplayed) showInfo()
    // this.date = datePicker.selectedDay + "/"+ datePicker.selectedMonth + "/" + datePicker.selectedYear
    this.date = (datePicker.selectedDay.toString().length == 1 ? "0"+ datePicker.selectedDay.toString() : datePicker.selectedDay.toString()) + "/" +
                (datePicker.selectedMonth.toString().length == 1 ? "0"+ datePicker.selectedMonth.toString() : datePicker.selectedMonth.toString()) + "/" +
                datePicker.selectedYear
  }
} 

export var ticket = new Ticket();

buyTicketBtn.addEventListener("click", (e)=>{
  e.preventDefault();
  socket.emit("server-gateway", {opcode:"book_ticket", ticket:ticket})
})





function verifierSwitcher(elmt:HTMLInputElement, state:boolean){
  if (elmt === starting_station_input_field){
    starting_station_verified = state;
    if (starting_station_verified){
      ticket.startingStation = elmt.value;
      requestData("get_connected_stations", elmt.value);
    }
    else{
      ticket.startingStation = "";
     clearInfo();
     routePicker.clearRouteArray();
    }
  }
  else if (elmt === ending_station_input_field){
    ending_station_verified = state;
    if(ending_station_verified && starting_station_verified){
      ticket.destinationStation = ending_station_input_field.value;
      requestData("get_routes_with_stations", starting_station_input_field.value, ending_station_input_field.value)
    }
    else if (!ending_station_verified || !starting_station_verified) {
      ticket.destinationStation ="";
      clearInfo();
      routePicker.clearRouteArray();
    }
  }
}

socket.on("server-get-stations-linked-to-station", (data:string[]) =>{
  autocomplete(ending_station_input_field, data, eStation_checker)
});
socket.on("server-get-routes-with-stations", (data:object[])=>{
  routes_from_linked = data
  routePicker.setRouteArray(data)
});


function autocomplete(inp: HTMLInputElement, arr: string[], checker:HTMLDivElement) :void{
  var currentFocus: number, z:HTMLCollection;
  // Execute this when it's written in the input field
  inp.addEventListener("input", function(e) {
    var a:HTMLDivElement, b:HTMLDivElement, i:number, 
    suggestions:number = 0, val:string = this.value;

    verifierSwitcher(inp, false)
    checker.style.display="none";


      for (i = 0; i < arr.length; i++){
        if (capitalizeFirstLetter(val) === arr[i]){
          // If the input field has the save value as any station in the list from the server
          // Then we have a match.
          checker.style.display="block";
          inp.value = capitalizeFirstLetter(val)
          verifierSwitcher(inp, true)
          closeAllLists(null);
          return;
        } 
      }
      // Close any open lists
      closeAllLists(null);
      if(!val) return;     

      currentFocus = -1;
      // Create div element that will hold all autocomplete suggestions
      a = document.createElement("div");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      // append the DIV element as a child of the autocomplete container
      this.parentNode!.appendChild(a);

      for (i = 0; i < arr.length; i++) {
        // Check if the current val is anywhere inside the given array
        if (arr[i].toLocaleLowerCase().includes(val.toLowerCase())){
          suggestions++;
          if (suggestions > suggestions_amount){
            // No more than suggestions_amount suggestions
            break;
          }
          b = document.createElement("div");
          b.innerHTML = arr[i];
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              checker.style.display="block";
              verifierSwitcher(inp, true)
              closeAllLists(null);
          });
          a.appendChild(b);
        }
      }
    });

  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list")! as HTMLDivElement;
      if (x) {
        z = x.getElementsByTagName("div")! as HTMLCollection;
      }
      if (e.key === 'ArrowDown') {
        currentFocus++;
        addActive(z);
      } else if (e.key === 'ArrowUp') {

        currentFocus--;
        addActive(z);
      } else if (e.key === 'Enter' ) {
        e.preventDefault();
        if (currentFocus > -1) {
          var c = z[currentFocus] as HTMLDivElement
          if (z) c.click();
          verifierSwitcher(inp, true)
          checker.style.display="block";
        }
      }
  });

  // Helper functions
  function addActive(z:HTMLCollection){
    if (!z) return false;
    removeActive(z);
    if (currentFocus >= z.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (z.length - 1);
    z[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(z:HTMLCollection) :void{
    if(!z) return;
    for (var i = 0; i < z.length; i++) {
      z[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt:any):void {
    var x = document.getElementsByClassName("autocomplete-items")! as HTMLCollection;
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode!.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) :void{
      closeAllLists(e.target);
  });
}
