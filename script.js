//****Event Listeners****
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
$('.search').on('keyup', searchCards);
$('main').on('click', '.delete', deleteCard);
$('main').on('click', '.up-vote', voteUp);
$('main').on('click', '.down-vote', voteDown);

//****Functions****
function enableSaveButton() {
  if($('.user-title').val() !== "" && $('.user-body').val() !== "") {
    $('.save-button').removeAttr('disabled');
  } else {
    $('.save-button').attr('disabled', true)
  }
}

function Card(object) {
  this.title = object.title;
  this.body = object.body;
  this.id = object.id || Date.now();
  this.qualityIndex = object.qualityIndex || 3 ;
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
  // $('main').prepend(cardTemplate(card));
  renderCards(Card.findAll());
  resetInputs();
}

function storeCard(card) {
  Card.create(card);
}

function resetInputs() {
  $('.user-title').val("");
  $('.user-body').val("");
  $('.user-title').focus();
  enableSaveButton();
}

Card.create = function(card) {
  localStorage.setItem(card.id, JSON.stringify(card));
}

function cardTemplate(card) {
  $('main').prepend(
      `
        <article id=${card.id}>
          <h2 contenteditable=true class="card-title">${card.title}</h2>
          <button class="delete"></button>
          <p contenteditable=true class="card-body">${card.body}</p>
          <button class="up-vote"></button>
          <button class="down-vote"></button>
          <p class="quality">quality: </p><p class="level">${card.getQuality()}</p>
        </article>
      `
    )
}

function renderCards(cards = []) {
  $('main').empty();
  if(cards.length > 10) {
    renderTenCards(cards);
    displayShowMore();
  } else {
    renderAllCards(cards);
    hideShowMore();
  }
}

function renderTenCards(cards = []) {
  for ( var i = cards.length-10; i < cards.length; i++) {
      var card = cards[i];
      $('main').append(cardTemplate(card));
    }  
}

function renderAllCards(cards = []) {
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('main').append(cardTemplate(card));
  }
}

function displayShowMore() {
  $('.show-more').css('display', 'block');
}

function hideShowMore() {
  $('.show-more').css('display', 'none');
}

function showMoreCards() {
  $('main').empty();
  renderAllCards(Card.findAll());
  hideShowMore();
}

function clearAllCards(event) {
  event.preventDefault();
  $('article').remove();
  localStorage.clear();
  resetInputs();
}

function eventGetCard(event) {
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  return Card.find(id);
}

function editCardTitle(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.title = $(event.target).text();
  card.save();
}

function editCardBody(event){
  event.preventDefault();
  var card = eventGetCard(event);
  card.body = $(event.target).text();
  card.save();
}

function voteUp(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article');
  var card = eventGetCard(event);
  card.incrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
}

function voteDown(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article');
  var card = eventGetCard(event);
  card.decrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
}

Card.prototype.getQuality = function() {
  var qualityArray = [false, 'none', 'low', 'normal', 'high', 'critical'];
  return qualityArray[this.qualityIndex];
}

Card.prototype.incrementQuality = function() {
  var qualityArray = [false, 'none', 'low', 'normal', 'high', 'critical'];
  if (this.qualityIndex !== qualityArray.length - 1) {
    this.qualityIndex += 1;
  }
}

Card.prototype.decrementQuality = function() {
  if (this.qualityIndex !== 1) {
    this.qualityIndex -= 1;
  }
}

function deleteCard(event) {
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  // articleElement.remove();
  Card.delete(id);
  renderCards(Card.findAll());
}

Card.delete = function(id) {
  localStorage.removeItem(id);
}

Card.prototype.save = function() {
  Card.create(this);
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
    console.log(values);
    return values;
}

function searchCards() {
  var results;
  if ($('.search').val() !== "") {
    results = searchFilter();
  } else {
    results = Card.findAll();
  }
  displayFilter(results);
}

function searchFilter() {
  var cards = Card.findAll();
  var searchRegex = new RegExp($('.search').val().toLowerCase());
  var results = cards.filter(function(card) {
    return searchRegex.test(card.title.toLowerCase()) || searchRegex.test(card.body.toLowerCase());
  });
  return results;
}

function displayFilter(results) {
  $('main').empty();
  renderAllCards(results);
}

function filterImportance(importance) {
  var allCards = Card.findAll();
  var results = allCards.filter(function(card){
    return card.qualityIndex === importance;
  });
  displayFilter(results);
  hideShowMore();
}

function filterCritical() {
  filterImportance(5);
}

function filterHigh() {
  filterImportance(4);
}

function filterNormal() {
  filterImportance(3);
}

function filterLow() {
  filterImportance(2);
}

function filterNone() {
  filterImportance(1);
}


renderCards(Card.findAll());

