"use strict";

/**
 * Ce code est inspiré de cet article de blog : https://medium.com/@sergio13prez/fetching-them-all-poke-api-62ca580981a2
 * Il contient une bonne partie des notions que nous avons vues jusque là en cours de Javascript.
 */

/**
 * Je mets tous les querySelector en haut afin de "ranger" mon code
 * Si un autre développeur arrive sur mon code, il sait en un regard quels éléments ont déjà été sélectionnés
 */
const buttonFetchElement = document.querySelector(".btn-fetch");
const buttonFetchErrorElement = document.querySelector(".btn-fetch-error");
const loaderElement = document.querySelector(".loader");

const toastNotifElement = document.querySelector(".toast-notification");

const pokemonListElement = document.querySelector(".pokemon-list");

const pokemonPageElement = document.querySelector(".pokemons-page");
const pokemonDetailsElement = document.querySelector(".pokemon-details");
const pokemonImageElement = document.querySelector(".pokemon-image");

const pokemonNameElement = document.querySelector(".pokemon-name");
const pokemonNumberElement = document.querySelector(".pokemon-number");
const pokemonTypesListElement = document.querySelector(".pokemon-types");

let pokemonListItems; // Cette liste sera crée une fois que l'on aura récupéré les pokemons

// On "bind" la fonction fetchPokemonsBtnClick à l'évènement "click" du bouton "fetch pokemons"
buttonFetchElement.addEventListener("click", fetchPokemonsBtnClick);

buttonFetchErrorElement.addEventListener("click", fetchErrorBtnClick);

/*
 * On est obligés d'attendre que la page (html, css et javascript) soit complètement chargée avant de commencer l'animation de la toast notif
 * Sinon l'animation ne se voit pas
 */
window.addEventListener("load", (event) => {
  showToastNotif(
    "Pour gagner de l'argent sur votre dos sans vous faire payer, on revend vos données à Facebook en utilisant des cookies ! 🍪"
  );
});

function showToastNotif(text, error = false) {
  if (error) {
    toastNotifElement.style.backgroundColor = "#D32F2F";
  }
  toastNotifElement.classList.add("show");
  toastNotifElement.textContent = text;
  setTimeout(() => hideToastNotif(), 5000);
}

function hideToastNotif() {
  toastNotifElement.classList.remove("show");
}

function fetchPokemonsBtnClick() {
  fetchPokemons();
}

function fetchErrorBtnClick() {
  fetchPokemons(true);
}

// Cette fonction me permet d'avoir un code plus lisible
function hideFetchPokemonsButton() {
  changeElementVisibility(buttonFetchElement, false);
  changeElementVisibility(buttonFetchErrorElement, false);
}

function showFetchPokemonsButtons() {
  changeElementVisibility(buttonFetchElement, true);
  changeElementVisibility(buttonFetchErrorElement, true);
}

// Cette fonction me permet d'avoir un code plus lisible
function showPokemonPage() {
  changeElementVisibility(pokemonPageElement, true);
  changeElementVisibility(loaderElement, false);
}

function showLoader() {
  changeElementVisibility(loaderElement, true);
}

function hideLoader() {
  changeElementVisibility(loaderElement, false);
}

// Cette fonction me permet d'avoir un code un peu plus lisible
function changeElementVisibility(element, show) {
  if (show) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

function pokemonListItemClick(element, url) {
  /* On supprime la classe "selected" des autres éléments de la liste, pour qu'on ait qu'un seul élément sélectionné
   ** On aurait pu sauvegarder l'élément sélectionné pour ne changer la classe que de cet élément pour optimiser.
   ** Mais cela me sert comme example de querySelectorAll
   */
  pokemonListItems.forEach((pokemonListItem) =>
    pokemonListItem.classList.remove("selected")
  );
  element.classList.add("selected");
  fetchPokemonDetails(url);
}

function createPokemonListItemElement(name, url) {
  const pokemonElement = document.createElement("li");
  pokemonElement.classList.add("pokemon-list-item");
  pokemonElement.textContent = name;
  pokemonListElement.append(pokemonElement);
  pokemonElement.addEventListener("click", (event) => {
    // le paramètre event de l'évènement possède beaucoup de propriétés très utiles.
    // par exemple, event.target retourne l'élément html cliqué
    pokemonListItemClick(event.target, url);
  });
}

function createPokemonList(pokemons) {
  // Pour chacun des pokemons récupérés de l'api, nous créons un élément de list que nous ajoutons à la fin de la liste
  pokemons.forEach((pokemon) =>
    createPokemonListItemElement(pokemon.name, pokemon.url)
  );
  pokemonListItems = document.querySelectorAll(".pokemon-list-item");
}

/**
 * La fonction d'API fetch a un comportement particulier et ne gère pas les erreurs de manière classique en utilisant des "throw Error" pour "lancer" des erreurs
 * Cette fonction permet de "lancer" une erreur que l'on pourra "attraper" dans un "catch" plus tard
 * Je me suis appuyé sur cet article : https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
 */
function handleFetchErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function responseToJSON(response) {
  return response.json(); // On transforme la réponse en objet JSON. Utilisation de la version "comprimée" des arrow functions.
}

// Cette fonction me permet de faire du code DRY
// Tous mes appels API passeront par cette fonction
// Donc tous mes appels API auront une gestion générique des erreurs et cacheront le loader
function callApi(url) {
  showLoader();
  // Fetch retourne une Promise
  return fetch(url)
    .then(handleFetchErrors)
    .then(responseToJSON)
    .catch((error) => {
      // On "attrape" les erreurs qui auraient pu avoir lieu pendant la récupération des données
      // Une bonne gestion des erreurs est primordiale dans un projet bien conçu
      showToastNotif(
        "Une erreur s'est produite pendant la récupération des données",
        true
      );
    })
    .finally(() => {
      // Le code présent dans le bloc "finally" s'éxécute quelque soit le retour de la Promise
      // C'est un peu comme si on le mettait à la fois dans le bloc "then" ET dans le bloc "catch"
      hideLoader(); // quoiqu'il arrive, on cache le loader
    });
}

function fetchPokemons(emulateErrors = false) {
  hideFetchPokemonsButton(); // On cache le bouton Fetch

  const apiUrl = emulateErrors
    ? "http://httpstat.us/500" // Pour tester des retours d'erreurs d'api et vérifier que notre code gère correctement les erreurs et ne "bloque" pas l'interface pour l'utilisateur
    : "https://pokeapi.co/api/v2/pokemon?limit=151"; // On fait un appel à l'api Pokemon

  // Je crée un petit délai avant d'appeler l'API, afin que l'on ait le temps de voir le loader. Il ne sert qu'à la démo
  showLoader();
  setTimeout(() => {
    callApi(apiUrl).then((allPokemons) => {
      console.log(allPokemons); // Regardez l'objet JSON retourné dans la console de votre navigateur
      // Puis on éxécute la suite de notre code avec la liste de pokemons reçue
      showPokemonPage();
      createPokemonList(allPokemons.results);
    });
  }, 1000); // délai de 1s (1000ms)

  console.log("fetching data"); // Ce console log sera exécuté AVANT la récupération des données de l'API. Cela montre bien que fetch est une fonction asynchrone qui a besoin qu'on "attende" son résultat
}

function clearPokemonTypesList() {
  pokemonTypesListElement.innerHTML = '';
}

function createPokemonTypeElement(typeName) {
  const typeElement = document.createElement("li");
  typeElement.classList.add("pokemon-type");
  typeElement.classList.add("pokemon-type-" + typeName);
  typeElement.textContent = typeName;
  pokemonTypesListElement.append(typeElement);
}

function populatePokemonDetail(pokemonData) {
  pokemonImageElement.srcset = `https://pokeres.bastionbot.org/images/pokemon/${pokemonData.id}.png`;
  pokemonNameElement.textContent = pokemonData.name;
  pokemonNumberElement.textContent = pokemonData.order;
  pokemonData.types.forEach(type => {
    createPokemonTypeElement(type.type.name);
  });
}

function fetchPokemonDetails(url) {
  pokemonDetailsElement.classList.add("hidden");
  callApi(url).then((pokemonData) => {
    console.log(pokemonData);
    clearPokemonTypesList();
    populatePokemonDetail(pokemonData);
    pokemonDetailsElement.classList.remove("hidden");
    hideLoader();
  });
}
