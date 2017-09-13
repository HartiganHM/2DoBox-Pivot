//****Event Listeners****
 $(document).ready(function(){
    enableControlButtons();
    getFromStorage();
 });

$(document).on('blur', '.card-title', editCardTitle);
$(document).on('blur', '.card-body', editCardBody);
$('.clear-all-button').on('click', clearAllCards);
$('.save-button').on('click', createCard);
$('.show-more').on('click', showMoreCards);
$('.critical-btn').on('click', filterCritical);
$('.high-btn').on('click', filterHigh);
$('.normal-btn').on('click', filterNormal);
$('.low-btn').on('click', filterLow);
$('.none-btn').on('click', filterNone);
$('.user-title, .user-body').on('keyup', enableSaveButton);
$('.user-title, .user-body').on('keyup', characterCounter);
$('.search').on('keyup', searchCards);
$('main').on('click', '.delete', deleteCard);
$('main').on('click', '.up-vote, .down-vote', qualityHandler);
$('main').on('click', '.completed', completedCard);

//****Card Object****
function Card(object) {
  this.title = object.title;
  this.body = object.body;
  this.id = object.id || Date.now();
  this.quality = 'normal';
  this.completed = false;
}

function tweakQuality(direction, currentQuality) {
  var qualityArray = ['none', 'low', 'normal', 'high', 'critical'];
  var index = qualityArray.indexOf(currentQuality);
  direction === true? index++ : index--;
  return qualityArray[index];
}

function qualityHandler(event) {
  var $cardQuality = $(this).siblings('.level');
  var newQuality = tweakQuality($(this).hasClass('up-vote'), $cardQuality.text());
  var storedCard = eventGetCard(event);
  $cardQuality.text(newQuality);
  storedCard.quality = newQuality;
  saveToStorage(storedCard);
}

function deleteCard(event) {
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  articleElement.remove();
  localStorage.removeItem(id);
  enableControlButtons();
}

function eventGetCard(event) {
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  return JSON.parse(localStorage.getItem(id));
}

 function getFromStorage() {
  keys = Object.keys(localStorage);
  for (var i = 0; i < keys.length; i++) {
    cardTemplate(JSON.parse(localStorage.getItem(keys[i])));
  }
}

function saveToStorage(card) {
  localStorage.setItem(card.id, JSON.stringify(card));
}

//****Functions****
function cardTemplate(card) {
  $('main').prepend(
      `
        <article class="card" id=${card.id}>
          <h2 contenteditable=true class="card-title">${card.title}</h2>
          <button class="delete"></button>
          <p contenteditable=true class="card-body">${card.body}</p>
          <button class="up-vote"></button>
          <button class="down-vote"></button>
          <p class="quality">quality: </p><p class="level">${card.quality}</p><p class="completed">Completed</p>
        </article>
      `
    )
}

function clearAllCards(event) {
  event.preventDefault();
  $('article').remove();
  localStorage.clear();
  resetInputs();
  enableControlButtons();
  hideShowMore();
}

function completedCard(event) {
  // var card = eventGetCard(event);
  card.completed = true;
  $(this).parent().addClass('completed-card');
  // console.log(card);
  // saveToStorage(card);
  // console.log(card);
}

function createCard(event) {
  event.preventDefault();
  var title = $('.user-title').val();
  var body = $('.user-body').val();
  var theCard = new Card({title, body});
  storeCard(theCard);
  displayCard(theCard);
}

function displayCard(card) {
  $('main').prepend(cardTemplate(card));
  resetInputs();
  hideOldCards();
  enableControlButtons();
}

function editCardBody(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.body = $(event.target).text();
  saveToStorage(card);
}

function editCardTitle(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.title = $(event.target).text();
  saveToStorage(card);
}

function enableControlButtons() {
  console.log('I super promise I am running')
  if($('.card').length > 0) {
    console.log('running');
    $('.importance').prop('disabled', false);
    $('.clear-all-button').prop('disabled', false);
  } else {
    $('.importance').prop('disabled', true);
    $('.clear-all-button').prop('disabled', true);
  }
}

function enableSaveButton() {
  if($('.user-title').val() !== "" && $('.user-body').val() !== "") {
    $('.save-button').removeAttr('disabled');
  } else {
    $('.save-button').attr('disabled', true);
  }
}

function hideShowMore() {
  $('.show-more').css('display', 'none');
}

function renderCards(cards = []) {
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('main').append(cardTemplate(card));
  }
  hideCompleted(cards);

  //do we need the :visible selector?
  var domCards = $('.card:visible')
  if(domCards.length > 10) {
    hideOldCards();
  }

  // $('main').empty();
  // if(cards.length > 10) {
  //   renderTenCards(cards);
  //   displayShowMore();
  // } else {
  //   renderAllCards(cards);
  //   hideShowMore();
  // }
}

function hideOldCards() {
  var cards = $('.card');
  for(var i = 10; i < cards.length; i++) {
    $(cards[i]).hide();
  }
  displayShowMore();
}

// function renderAllCards(cards = []) {
//   for ( var i = 0; i < cards.length; i++) {
//     var card = cards[i];
//     $('main').append(cardTemplate(card));
//   }
// }

// function renderTenCards(cards = []) {
//   for ( var i = cards.length-10; i < cards.length; i++) {
//       var card = cards[i];
//       $('main').append(cardTemplate(card));
//     }  
// }

function resetInputs() {
  $('.user-title').val("");
  $('.user-body').val("");
  $('.user-title').focus();
  enableSaveButton();
}

function searchCards() {
  var results;
  if ($('.search').val() !== "") {
    results = searchFilter();
  } else {
    results = $('.card');
  }
  displayFilter(results);
}

function searchFilter() {
  var results = [];
  $('.card').each(function(index, card){
    if ($(this).children('.card-title').text().toLowerCase().includes($('.search').val().toLowerCase()) || $(this).children('.card-body').text().toLowerCase().includes($('.search').val().toLowerCase())) {
      results.push(card);
    }
  });
  console.log("DOM Object" + results);
  return results;
}

function storeCard(card) {
  Card.create(card);
}


//****Show More Cards****
function displayFilter(results) {
  $('.card').hide();
  $(results).show();
  hideShowMore();
}

function displayShowMore() {
  $('.show-more').css('display', 'block');
}

function showMoreCards() {
  var cards = $('.card');
  for(var i = 10; i < cards.length; i++) {
    $(cards[i]).show();
  }
  hideShowMore();
}

//****Filter Importance****
function filterImportance(importance) {
  var results = [];
    $('.card').each(function(index, card){
      if ($(this).children('.level').text().includes(importance)) {
        results.push(card);
      }
    });
  displayFilter(results);
}

function filterCritical() {
  filterImportance('critical');
}

function filterHigh() {
  filterImportance('high');
}

function filterNormal() {
  filterImportance('normal');
}

function filterLow() {
  filterImportance('low');
}

function filterNone() {
  filterImportance('none');
}

//****Character Counter****
function characterCounter() {
  $('.title-chars').text(($('.user-title').val().length));
  $('.body-chars').text(($('.user-body').val().length));

//if statement not working because the if statement in the enableSaveButton function is overriding.
   if(parseInt($('.title-chars').text()) > 20 || parseInt($('.body-chars').text()) > 20) {
      $('.save-button').removeAttr('disabled');
  }
}
















