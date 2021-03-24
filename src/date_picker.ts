import { ticket } from "./index";

const datePickerElement = document.querySelector(
  "form .date-picker-container"
)! as HTMLDivElement;
const selectedDateElement = document.querySelector(
  "form .date-picker-container .selected-date"
)! as HTMLDivElement;
const dates_element = document.querySelector(
  "form .date-picker-container .dates"
)!as HTMLDivElement;
const mth_element = document.querySelector(
  "form .date-picker-container .dates .month .mth"
)!as HTMLDivElement;
const nextMthElement = document.querySelector(
  "form .date-picker-container .dates .month .next-mth"
)!as HTMLDivElement;
const prevMthElement = document.querySelector(
  "form .date-picker-container .dates .month .prev-mth"
)!as HTMLDivElement;
const days_element = document.querySelector(
  "form .date-picker-container .dates .days"
)!as HTMLDivElement;

const months:string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var oddMonth = true;

let date = new Date();
let day = date.getDate();
let month = date.getMonth();
let year = date.getFullYear();

var thisMonth = month;
var thisYear = year;

//Make the default today
export var selectedDate = date;
export var selectedDay = day;
export var selectedMonth = month+1;
export var selectedYear = year;




mth_element.textContent = months[month] + " " + year;

selectedDateElement.textContent = formatDate(date);
selectedDateElement.dataset.value = selectedDate.toString();

populateDates();

// EVENT LISTENERS
datePickerElement.addEventListener("click", toggleDatePicker);
nextMthElement.addEventListener("click", goToNextMonth);
prevMthElement.addEventListener("click", goToPrevMonth);

// FUNCTIONS
function toggleDatePicker(e:Event) {
  if (!checkEventPathForClass(e.composedPath(), "dates")) {
    dates_element.classList.toggle("active");
  }
}

function goToNextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  mth_element.textContent = months[month] + " " + year;
  populateDates();
}


function goToPrevMonth() {
  if (thisMonth === month && thisYear === year) {
    return;
  }
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  mth_element.textContent = months[month] + " " + year;
  populateDates();
}


function populateDates() {
  days_element.innerHTML = "";
  let amount_days = 30;
  if (month % 2) amount_days = 31;

  if (month == 1) {
    amount_days = 28;
  }

  for (let i = 0; i < amount_days; i++) {
    const day_element = document.createElement("div");
    day_element.classList.add("day");
    day_element.textContent = (i + 1).toString();

    if (
      selectedDay == i + 1 &&
      selectedYear == year &&
      selectedMonth == month
    ) {
      day_element.classList.add("selected");
    }

    day_element.addEventListener("click", function () {
      selectedDate = new Date(year + "-" + (month + 1) + "-" + (i + 1));

      let ss = new Date();

      if (selectedDate.getDate() < ss.getDate()) {
        if (selectedDate.getMonth() <= ss.getMonth()) {
          console.log("You cannot select an already past Date!");
          return;
        }
      }
      selectedDay = i + 1;
      selectedMonth = month+1;
      selectedYear = year;
      ticket.recalculate();


      dates_element.classList.toggle("active");

      // Here!
      selectedDateElement.textContent = formatDate(selectedDate);
      selectedDateElement.dataset.value = selectedDate.toString();

      populateDates();
    });

    days_element.appendChild(day_element);
  }
}

// HELPER FUNCTIONS
function checkEventPathForClass(path:EventTarget[], selector:string) {
  for (let i = 0; i < path.length; i++) {
    //@ts-ignore
    if (path[i].classList && path[i].classList.contains(selector)) {
      return true;
    }
  }

  return false;
}
function formatDate(date:Date):string {
  let day:string|number = date.getDate();
  if (day < 10) {
    day = "0" + day;
  }

  let month:string|number = date.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }

  let year = date.getFullYear();

  return day + " / " + month + " / " + year;
}
