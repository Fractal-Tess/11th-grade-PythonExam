import { ticket } from "./index";

// Passenger count
const adults_inp_field = document.getElementById('adults')! as HTMLInputElement
const kids_inp_field = document.getElementById('kids')! as HTMLInputElement

// class PassengerManager{
//     max:number;
//     min:number;
//     elmt:HTMLInputElement;
//     selected:number;

//     constructor(max:number, min:number, elmt:HTMLInputElement, callback:Function){
//         this.elmt = elmt;
//         this.selected = +elmt.value
//         this.max = max;
//         this.min = min;
//         this.elmt.addEventListener("input", (e)=>{
//             if (this.elmt.value === "") return;
//             if (+this.elmt.value > this.max){
//                  this.elmt.value = this.max.toString();
//             }      
//             if (+this.elmt.value < this.min){
//             this.elmt.value = this.min.toString();
//             }
//             this.selected = +this.elmt.value;
//             callback(this.selected)
//         })      
//     };
// }

// export function passenger_managerInit(){
//     const adultTickets = new PassengerManager(10, 1, adults_inp_field, ticket.setAdults)
//     const kidsTickets = new PassengerManager(10, 0, kids_inp_field, ticket.setKids);
// }

var selectedKids, selectedAdults;
var maxAdults =10, minAdults=1;
var maxKids =10, minKids = 0;

document.addEventListener("click", (e)=>{
    if (adults_inp_field.value ==="") 
    {
        adults_inp_field.value = minAdults.toString();
        selectedAdults = 1;
        ticket.setAdults(selectedAdults)
    }

    if (kids_inp_field.value ==="")
    { 
        kids_inp_field.value = minKids.toString();
        selectedKids = 0;
        ticket.setKids(selectedKids)
    }
})
adults_inp_field.addEventListener("input", function() {
    if (this.value ==="") return;
    if (+this.value > maxAdults){
        this.value = maxAdults.toString();
    }
    else if (+this.value < minAdults){
        this.value = minAdults.toString();
    }
    selectedAdults = +this.value;
    ticket.setAdults(selectedAdults)
})

kids_inp_field.addEventListener("input", function() {
    if (this.value ==="") return;
    if (+this.value > maxKids){
        this.value = maxKids.toString();
    }
    else if (+this.value < minKids){
        this.value = minKids.toString();
    }
    selectedKids = +this.value
    ticket.setKids(selectedKids)
})

