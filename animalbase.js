"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

const settings = {
  filterBy: "all",
  sortBy: "name",
  sortDir: "asc",
};

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
};

function start() {
  console.log("ready");

  // igangsætter funktionen der sætter eventlisteners på buttons
  registerButtons();
  sort();

  loadJSON();
}

//Add event-listeners to filter and sort buttons
function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
}

function sort() {
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  jsonData.forEach((jsonObject) => {
    // TODO: This might not be the function we want to call first
    const animal = Object.create(Animal);

    const fullname = jsonObject.fullname;
    // trækker dataen ud fra json
    const firstSpace = fullname.indexOf(" ");
    const secondSpace = fullname.indexOf(" ", firstSpace + 1);
    const lastSpace = fullname.lastIndexOf(" ");

    const firstName = fullname.substring(0, firstSpace);
    const desc = fullname.substring(secondSpace + 1, lastSpace);
    const type = fullname.substring(lastSpace + 1);

    // putter ren data ind i nyt object
    animal.name = firstName;
    animal.desc = desc;
    animal.type = type;
    animal.age = jsonObject.age;

    //adder object til en global array
    allAnimals.push(animal);

    displayList(allAnimals);
  });
}

function prepareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "cat") {
    filteredList = allAnimals.filter(catFilter);
  } else if (settings.filterBy === "dog") {
    filteredList = allAnimals.filter(dogFilter);
  }

  return filteredList;
}

function catFilter(animal) {
  return animal.type === "cat";
}

function dogFilter(animal) {
  return animal.type === "dog";
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`user selected ${sortBy}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.sortDir = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(animalA, animalB) {
    if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allAnimals);
  const sortedList = sortList(currentList);
  displayList(sortedList);
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
