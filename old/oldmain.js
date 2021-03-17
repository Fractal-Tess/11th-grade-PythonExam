var socket = io();

var today = new Date();
var input_date;
// stif = starting_station_input_field
var stif = document.getElementById("sStation");
//  ending station input field
var esif = document.getElementById("eStation");

var from = document.getElementById("from");
var to = document.getElementById("to2");
var route = document.getElementById("route");
var timings = document.getElementById("timings");
var btn_book = document.getElementById("btn_book");
var input_date_field = document.getElementById("date_input");
var readyState = false;

var cur_ticket = {};

function clearTicketObject() {
  cur_ticket = {
    route_id: 0,
    routeOrigin: "",
    routeDestenation: "",
    startingStation: "",
    endingStaton: "",
    arivesAtStartingStation: "",
    arrivesAtEndStation: "",
    when: "",
  };
}

socket.on("connect", () => {
  //Cennection has escalted to the websocket protocol!
  socket.emit("msg", "Websocket connection!");
  console.log("Connected through websockets");
  //Instantly request all unique stations.
  stage1();
});

function stage1() {
  socket.emit("gus");
  //After requesting, the server should respond with a data array of strings('stations'),
  //Also we recieve a callback which we call instantly to indicate we recieved the data.
  socket.on("s_gus", (unique_stations, ack) => {
    ack();
    //Enable the field for statring station to be autcomplete
    autocomplete(stif, unique_stations, stage2);
  });
}

function stage2() {
  socket.emit("grwst", stif.value.toUpperCase());
}
socket.on("s_grwst", (station_array, ack) => {
  ack();
  autocomplete(esif, station_array, stage3);
});

function stage3() {
  from.innerHTML = "From: " + capitalizeFirstLetter(stif.value);
  to.innerHTML = "To: " + capitalizeFirstLetter(esif.value);

  socket.emit("grwsnes", stif.value.toUpperCase(), esif.value.toUpperCase());
}
socket.on("s_grwsnes", (data, ack) => {
  ack();
  if (data.length > 1) {
    console.log("WE HAVE A BIG PROBLEM");
  } else {
    finalize(data);
  }
});

function finalize(data) {
  cur_ticket.route_id = data[0].route_id;
  cur_ticket.routeOrigin = data[0].route_origin;
  cur_ticket.routeDestenation = data[0].route_destination;
  cur_ticket.startingStation = stif.value;
  cur_ticket.endingStaton = esif.value;
  cur_ticket.arivesAtStartingStation = data[0].arrives_at_starting;
  cur_ticket.arrivesAtEndStation = data[0].arrives_at_ending;
  route.innerText =
    "Train Route => Origin:" +
    capitalizeFirstLetter(cur_ticket.routeOrigin) +
    " Destination: " +
    capitalizeFirstLetter(cur_ticket.routeDestenation);

  timings.innerText =
    "Timings: Тrain arrives at " +
    stif.value +
    " at: " +
    data[0].arrives_at_starting +
    " | Train reaches destination at " +
    esif.value +
    " at: " +
    data[0].arrives_at_ending;
  readyState = true;
}

function bookTicket(ticketObject) {
  socket.emit("book_ticket", ticketObject);
  console.log("Ticket booked!");
}
socket.on("s_book_ticket_response", (data) => {
  console.log(data);
});
// socket.on("s_grwus", (station_array, ack) => {
//   ack();
//   console.log(station_array);
//   autocomplete(document.getElementById("eStation"), station_array, subbmitBtn);
// });
btn_book.addEventListener("click", () => {
  if (readyState) {
    input_date = new Date(input_date_field.value);
    cur_ticket.when = input_date_field.value;
    if (input_date > today) {
      bookTicket(cur_ticket);
    }
  }
});

function clear_description() {
  from.innerText = "From: ";
  to.innerText = "To: ";
  route.innerText = "Train Route =>";
  timings.innerText = "Timings:";
}

//grws = get routes with starting station
function destenation_field() {}

function autocomplete(inp, arr, callback) {
  /*The autocomplete function takes two parameters:
  The text field element and an array of possible autocompleted values:*/
  var currentFocus;

  /*execute a function when it's  writen in the text field:*/
  inp.addEventListener("input", function () {
    readyState = false;
    clearTicketObject();
    var val = this.value;
    clear_description();
    if (this.id == "sStation") {
      if (esif.value) {
        esif.value = "";
      }
    }

    /*close any already open lists of autocompleted values*/
    closeAllLists();

    //Check to see if the textfield is empty
    if (!val) {
      return false;
    }

    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", +this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    inp.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        b.innerHTML = capitalizeFirstLetter(arr[i]);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML +=
          "<input type='hidden' value='" + capitalizeFirstLetter(arr[i]) + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        if (arr.includes(inp.value.toUpperCase())) {
          inp.value = capitalizeFirstLetter(inp.value);
          closeAllLists();
          callback();
        }
        b.addEventListener("click", function () {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          callback();
        });
        a.appendChild(b);
      }
      // if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
      // }
    }
  });
  //Execute this if we press any keys
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById("autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      //If the arrow DOWN key is pressed, increase the currentFocus variable
      currentFocus++;
      //Make it visable by making it active
      addActive(x);
    } else if (e.keyCode == 38) {
      //Same thing as before but we go up
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      //Prevent submission
      e.preventDefault();
      if (currentFocus > -1) {
        //Simulate a click on the item
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    //Remove the active class on all items
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    //Add class autocomplete-active
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    //Remove the active class from the autocompelte list
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    //Close all suggestions except the one pressed on
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  //If clicked on the document, we close all active autocomplete suggestions
  document.addEventListener("click", (e) => {
    closeAllLists(e.target);
  });
}

function capitalizeFirstLetter(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
