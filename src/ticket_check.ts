import { capitalizeFirstLetter } from "./helper"
const socket = require("socket.io-client")()

var allTicketNumbers = []
const suggestions = 5;

const ticketNumberInputElement =document.getElementById("tni")! as HTMLInputElement

const ticketChecker = document.getElementById("ch3")! as HTMLDivElement
const parent = document.getElementById('label_holder')!.children
ticketChecker.style.display = "none"

socket.on("connect",() => {
    console.log("Connected with SocketIO")
})

socket.emit("get-all-ticket-numbers")
socket.on("server-get-all-ticket-numbers", (data:string[])=>{
    console.log(data)
    allTicketNumbers = data
    autocomplete(ticketNumberInputElement, allTicketNumbers, ticketChecker)
})

function reqestTicketData(ticketNumber:string){
  socket.emit("get-ticket-data", ticketNumber)
}
socket.on("server-ticket-data-response", (data:object)=>{
  //@ts-ignore
  parent[0].textContent=data["route_name"]
  //@ts-ignore
  parent[1].textContent=data["startStation"]
  //@ts-ignore
  parent[2].textContent=data["destination"]
  //@ts-ignore
  parent[3].textContent=data["arrives_at_starting"]
  //@ts-ignore
  parent[4].textContent=data["arrives_at_destination"]
  //@ts-ignore
  parent[5].textContent=data["adult_passengers"]
  //@ts-ignore
  parent[6].textContent=data["kid_passengers"]
  //@ts-ignore
  parent[7].textContent=data["ticket_price"]
  //@ts-ignore
  parent[8].textContent=data["date"]
})

function clearInfo(){
  for(let i =0; i<parent.length;i++){
    parent[i].textContent = ""
  }
}

function autocomplete(inp: HTMLInputElement, arr: string[], checker:HTMLDivElement) :void{
  var currentFocus: number, z:HTMLCollection;
  // Execute this when it's written in the input field
  inp.addEventListener("input", function(e) {
    var a:HTMLDivElement, b:HTMLDivElement, i:number, 
    suggestions:number = 0, val:string = this.value;
    clearInfo();
    checker.style.display="none";


      for (i = 0; i < arr.length; i++){
        if (capitalizeFirstLetter(val) === arr[i]){
          // If the input field has the save value as any station in the list from the server
          // Then we have a match.
          checker.style.display="block";
          inp.value = capitalizeFirstLetter(val)
          reqestTicketData(inp.value)
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
          if (suggestions > suggestions){
            // No more than suggestions_amount suggestions
            break;
          }
          b = document.createElement("div");
          b.innerHTML = arr[i];
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              checker.style.display="block";
              reqestTicketData(inp.value)
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
          reqestTicketData(inp.value)
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