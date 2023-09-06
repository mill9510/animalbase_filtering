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
  star: false,
  winner: false,
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
    // fixed so we build and sort on the first load
    buildList();
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

  //denne fortæller at hvis star er true skal den vise full star
  //og hvis den er false skal den vise empty star
  if (animal.star === true) {
    clone.querySelector("[data-field=star]").textContent = "★";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  //eventlistener på star, som refererer til clickstar
  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  // denne fortæller at hvis star er true og der klikkes skal den ændres til false
  // og hvis den er false ændres den til true
  function clickStar() {
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  //winner
  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;

  //eventlistener på winner, som refererer til clickWinner
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);

  // denne if else fortæller at hvis winner er true når der klikkes skal den blive false
  // og hvis den er false når der klikkes skal den blive true
  function clickWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      tryToMakeAWinner(animal);
    }

    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal) {
  //samling af vindere
  const winners = allAnimals.filter((animal) => animal.winner);

  // afgiver antallet af vindere
  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  //if there is another of the same type or more than two winners
  if (other !== undefined) {
    console.log("There can only be one of the same type!");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be two winners!");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    //ask user to ignore or remove 'other'
    //fjerner classen hide på removeother boksen
    document.querySelector("#removeOther").classList.remove("hide");
    //eventlistener som refererer til closedialgue
    document.querySelector("#removeOther .closebutton").addEventListener("click", closeDialogue);
    // eventlistener som refererer til clickremoveother
    document.querySelector("#removeOther #removeOtherButton").addEventListener("click", clickRemoveOther);

    document.querySelector("#removeOther [data-field=otherwinner]").textContent = other.name;

    //if ignore - do nothing
    function closeDialogue() {
      document.querySelector("#removeOther").classList.add("hide");
      document.querySelector("#removeOther .closebutton").removeEventListener("click", closeDialogue);
      document.querySelector("#removeOther #removeOtherButton").removeEventListener("click", clickRemoveOther);
    }

    //if remove other
    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);
      //buildlist for at opdatere listen, så den nye selected fremtræder i stedet
      buildList();
      // denne sørger for at dialogue lukker når valget træffes
      closeDialogue();
    }
  }

  function removeAorB(winnerA, winnerB) {
    // ask the user to ignore or remove a or b
    document.querySelector("#removeAorB").classList.remove("hide");
    //eventlistener som refererer til closedialgue
    document.querySelector("#removeAorB .closebutton").addEventListener("click", closeDialogue);
    // eventlistener som refererer til clickremoveA
    document.querySelector("#removeAorB #removeA").addEventListener("click", clickRemoveA);
    // eventlistener som refererer til clickremoveB
    document.querySelector("#removeAorB #removeB").addEventListener("click", clickRemoveB);

    //if ignore - do nothing
    function closeDialogue() {
      document.querySelector("#removeAorB").classList.add("hide");
      document.querySelector("#removeAorB .closebutton").removeEventListener("click", closeDialogue);
      document.querySelector("#removeAorB #removeA").removeEventListener("click", clickRemoveA);
      document.querySelector("#removeAorB #removeB").removeEventListener("click", clickRemoveB);
    }

    //show names on buttons
    document.querySelector("#removeAorB [data-field=winnerA]").textContent = winnerA.name;
    document.querySelector("#removeAorB [data-field=winnerB]").textContent = winnerB.name;

    //if remove A:
    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);

      buildList();
      closeDialogue();
    }

    // else - if remove B
    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);

      buildList();
      closeDialogue();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
