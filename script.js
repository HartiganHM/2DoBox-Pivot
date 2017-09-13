//****Event Listeners****
 $(document).ready(function(){
    enableControlButtons();
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
$('main').on('click', '.up-vote', voteUp);
$('main').on('click', '.down-vote', voteDown);
$('main').on('click', '.completed', completedCard);

//****Card Object****
function Card(object) {
  this.title = object.title;
  this.body = object.body;
  this.id = object.id || Date.now();
  this.qualityIndex = object.qualityIndex || 3 ;
  this.completed = false;
}

Card.create = function(card) {
  localStorage.setItem(card.id, JSON.stringify(card));
}

Card.prototype.decrementQuality = function() {
  if (this.qualityIndex !== 1) {
    this.qualityIndex -= 1;
  }
}

Card.prototype.incrementQuality = function() {
  var qualityArray = [false, 'none', 'low', 'normal', 'high', 'critical'];
  if (this.qualityIndex !== qualityArray.length - 1) {
    this.qualityIndex += 1;
  }
}

Card.delete = function(id) {
  localStorage.removeItem(id);
  enableControlButtons();
}

Card.find = function(id) {
  return new Card(JSON.parse(localStorage.getItem(id)));
}

Card.findAll = function() {
  var values = [],
  keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      values.push(new Card(JSON.parse(localStorage.getItem(keys[i]))));
    }
    return values;
}



// Card.findCompleted = function() {
//   var values = [],
//   keys = Object.keys(localStorage);
//     for (var i = 0; i < keys.length; i++) {
//       values.push(new Card(JSON.parse(localStorage.getItem(keys[i]))));
//     }
//   values.forEach(function(card) {
//     console.log(card.completed);
//   }) 
// }

Card.prototype.getQuality = function() {
  var qualityArray = [false, 'none', 'low', 'normal', 'high', 'critical'];
  return qualityArray[this.qualityIndex];
}

Card.prototype.save = function() {
  Card.create(this);
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
          <p class="quality">quality: </p><p class="level">${card.getQuality()}</p><p class="completed">Completed</p>
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
}

function completedCard(event) {
  var card = eventGetCard(event);
  card.completed = true;
  $(this).parent().addClass('completed-card');
  card.save();
}

function hideCompleted(cards) {
  // cards = JSON.stringify(cards);
  console.log('cards passed in: ')
  console.log(cards);

  //COMPLETED HAS NOTHING!!!!!!!
  var completed = cards.filter(function(card) {
    return card.completed === true;
  });
  console.log('completed: ')
  console.log(completed);
  var completedCards = [];
  for(var i = 0; i < completed.length; i++) {
    completedCards.push(Card.find(completed[i].id));
  }
  console.log('completedCards: ');
  console.log(completedCards);
  $(completedCards).hide();
}

function createCard(event) {
  event.preventDefault();
  var title = $('.user-title').val();
  var body = $('.user-body').val();
  var theCard = new Card({title, body});
  storeCard(theCard);
  displayCard(theCard);
  enableControlButtons();
}

function deleteCard(event) {
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  articleElement.remove();
  Card.delete(id);
}

function displayCard(card) {
  $('main').prepend(cardTemplate(card));
  resetInputs();
}

function editCardBody(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.body = $(event.target).text();
  card.save();
}

function editCardTitle(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.title = $(event.target).text();
  card.save();
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

function eventGetCard(event) {
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  return Card.find(id);
}

function hideShowMore() {
  $('.show-more').css('display', 'none');
}

function renderCards(cards = []) {
  hideCompleted(cards);

  $('main').empty();
  if(cards.length > 10) {
    renderTenCards(cards);
    displayShowMore();
  } else {
    renderAllCards(cards);
    hideShowMore();
  }
}

function renderAllCards(cards = []) {
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('main').append(cardTemplate(card));
  }
}

function renderTenCards(cards = []) {
  for ( var i = cards.length-10; i < cards.length; i++) {
      var card = cards[i];
      $('main').append(cardTemplate(card));
    }  
}

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

function voteDown(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article');
  var card = eventGetCard(event);
  card.decrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
}

function voteUp(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article');
  var card = eventGetCard(event);
  card.incrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
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
  $('main').empty();
  renderAllCards(Card.findAll());
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





renderCards(Card.findAll());










