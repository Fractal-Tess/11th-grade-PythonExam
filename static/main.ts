// Socket Io
// import { io } from "socket.io-client";
const socket = io();

// Variables
const suggestions_amount = 10;

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

// Labels
const l_route = document.getElementById("l_route")!as HTMLLabelElement
const l_from = document.getElementById('l_from')! as HTMLLabelElement
const l_to = document.getElementById('l_to')!as HTMLLabelElement
const l_when_board = document.getElementById('l_when_board')!as HTMLLabelElement
const l_get_off = document.getElementById('l_get_off')!as HTMLLabelElement
// document.getElementsByClassName("l_get_off")[0]! as HTMLInputElement
// ...Let's just give them IDS

const uniqueStations:string[] = [];

// On established connection
socket.on("connect", () =>{
    console.log("Connected with SocketIO")
})

function getData(opcodein:string){
  socket.emit("server-gateway", {opcode:opcodein})
}
getData("get_unique_station_names");

// listen to server responses
socket.on("server-get-unique-response", (data:string[]) =>{
    data.forEach(stationName => {
        uniqueStations.push(stationName)
    });
  //Enable the autocomplete for Starting station
  autocomplete(starting_station_input_field, uniqueStations, sStation_checker)
})


function verifierSwitcher(id:string, state:boolean){
  if (id === starting_station_input_field.id){
    starting_station_verified = state;
    if (starting_station_verified){

    }
  }
  else if (id === ending_station_input_field.id){
    ending_station_verified = state;
  }
}

function autocomplete(inp: HTMLInputElement, arr: string[], checker:HTMLDivElement) :void{
  var currentFocus: number, z:HTMLCollection;
    // Execute this when it's written in the input field
  inp.addEventListener("input", function(e) {
    checker.style.display="none";
    verifierSwitcher(this.id, false);

      var a:HTMLDivElement,
       b:HTMLDivElement,
        i:number,
         j:number,
          suggestions:number = 0,
          val:string = this.value;
      for (j = 0; j < arr.length; j++){
        if (capitalizeFirstLetter(val) === arr[j]){
          // If the input field has the save value as any station in the list from the server
          // Then we have a match.
          inp.value = arr[j];
          checker.style.display="block";
          verifierSwitcher(this.id, true);
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
        if (arr[i].toUpperCase().includes(val.toUpperCase())){
          suggestions++;
          if (suggestions > suggestions_amount){
            // No more than suggestions_amount suggestions
            break;
          }
          /*create a DIV element for each matching element:*/
          b = document.createElement("div");
          b.innerHTML = arr[i];
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              checker.style.display="block";
              verifierSwitcher(inp.id, true);
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
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
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(z);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(z);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          var c = z[currentFocus] as HTMLDivElement
          if (z) c.click();
          verifierSwitcher(inp.id, true);
          checker.style.display="block";
        }
      }
  });
  // Helper functions
  function addActive(z:HTMLCollection){
    /*a function to classify an item as "active":*/
    if (!z) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(z);
    if (currentFocus >= z.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (z.length - 1);
    /*add class "autocomplete-active":*/
    z[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(z:HTMLCollection) {
    /*a function to remove the "active" class from all autocomplete items:*/
    if(!z) return false;
    for (var i = 0; i < z.length; i++) {
      z[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt:any):void {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items")! as HTMLCollection;
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode!.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
function capitalizeFirstLetter(str:string) :string{
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}



// console.log(ending_station_input_field)
// console.log(starting_station_input_field)

// console.log(l_route)
// console.log(l_from)
// console.log(l_to)
// console.log(l_when_board)
// console.log(l_get_off)

