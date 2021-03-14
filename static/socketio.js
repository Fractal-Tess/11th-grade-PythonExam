var socket = io();
// stif = starting_station_input_field
var stif = document.getElementById("sStation");
//  ending station input field
var esif = document.getElementById("eStation");

var origin = document.getElementById("origin");
var destenation = document.getElementById("destenation");

//ALL CUMMINICATED ELEMENTS ARE UPPER CASE

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
  socket.on("s_gus", (station_array, ack) => {
    ack();
    //Enable the field for statring station to be autcomplete
    autocomplete(stif, station_array, stage2, origin);
  });
}

function stage2() {
  socket.emit("grwst", stif.value.toUpperCase());
}
socket.on("s_grwst", (station_array, ack) => {
  ack();
  autocomplete(esif, station_array, stage3, destenation);
});

function stage3() {
  console.log("CALL");
  socket.emit("grwsnes", stif.value.toUpperCase(), esif.value.toUpperCase());
}
socket.on("s_grwsnes", (data, ack) => {
  ack();
  if (data.length > 1) {
    console.log("more than 1");
  } else {
  }
});

// socket.on("s_grwus", (station_array, ack) => {
//   ack();
//   console.log(station_array);
//   autocomplete(document.getElementById("eStation"), station_array, subbmitBtn);
// });

function subbmitBtn() {
  console.log("subbmit");
}

//grws = get routes with starting station
function destenation_field() {}

function autocomplete(inp, arr, callback, display) {
  /*The autocomplete function takes two parameters:
  The text field element and an array of possible autocompleted values:*/
  var currentFocus;

  /*execute a function when it's  writen in the text field:*/
  inp.addEventListener("input", function () {
    var val = this.value;

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
        b.addEventListener("click", function () {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          display.innerHTML = inp.value;
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
