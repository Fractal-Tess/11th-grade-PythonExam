// Socket Io
// import { io } from "socket.io-client";
var socket = io();
// Input fields
var starting_station_input_field = document.getElementById('sStation');
var ending_station_input_field = document.getElementById('eStation');
// Labels
var l_route = document.getElementById("l_route");
var l_from = document.getElementById('l_from');
var l_to = document.getElementById('l_to');
var l_when_board = document.getElementById('l_when_board');
var l_get_off = document.getElementById('l_get_off');
// document.getElementsByClassName("l_get_off")[0]! as HTMLInputElement
// ...Let's just give them IDS
var uniqueStations = [];
// On established connection
socket.on("connect", function () {
    console.log("Connected with SocketIO");
});
// Get all unique stations
socket.emit("server-gateway", { opcode: "get_unique_station_names" });
socket.on("server-get-unique-response", function (data) {
    data.forEach(function (stationName) {
        uniqueStations.push(stationName);
    });
});
autocomplete(starting_station_input_field, uniqueStations);
function autocomplete(inp, arr) {
    var currentFocus;
    // Execute this when it's written in the input field
    inp.addEventListener("input", function (e) {
        var a, b, i, j, suggestions = 0, val = this.value;
        for (j = 0; j < arr.length; j++) {
            if (capitalizeFirstLetter(val) === arr[j]) {
                console.log("We have a match");
                inp.value = arr[j];
                closeAllLists(null);
                return;
            }
        }
        /*close any already open lists of autocompleted values*/
        closeAllLists(null);
        if (!val) {
            return null;
        }
        currentFocus = -1;
        // Create div element that will hold all autocomplete suggestions
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].toUpperCase().includes(val.toUpperCase())) {
                suggestions++;
                if (suggestions > 10) {
                    break;
                }
                /*create a DIV element for each matching element:*/
                b = document.createElement("div");
                b.innerHTML = arr[i];
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists(null);
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x)
            x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        }
        else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        }
        else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x)
            return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
function capitalizeFirstLetter(str) {
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
