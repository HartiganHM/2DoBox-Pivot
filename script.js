//****Event Listeners****
$(document).on('blur', '.card-title', editCardTitle);
$(document).on('blur', '.card-body', editCardBody);
$('.clear-all-button').on('click', clearAllCards);
$('.save-button').on('click', createCard);

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
  this.qualityIndex = object.qualityIndex || 2 ;
}

function createCard(event) {
  event.preventDefault();
  var title = $('.user-title').val();
  var body = $('.user-body').val();
  var theCard = new Card({title, body});
  displayCard(theCard);
  storeCard(theCard);
}

function displayCard(card) {
  $('main').prepend(cardTemplate(card));
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
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('main').append(cardTemplate(card));
  }
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
  var qualityArray = ['none', 'low', 'normal', 'high', 'critical'];
  return qualityArray[this.qualityIndex];
}

Card.prototype.incrementQuality = function() {
  var qualityArray = ['none', 'low', 'normal', 'high', 'critical'];
  if (this.qualityIndex !== qualityArray.length - 1) {
    this.qualityIndex += 1;
  }
}

Card.prototype.decrementQuality = function() {
  if (this.qualityIndex !== 0) {
    this.qualityIndex -= 1;
  }
}

function deleteCard(event) {
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  articleElement.remove();
  Card.delete(id);
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
    return values;
}

function searchCards() {
  var results;
  if ($('.search').val() !== "") {
    results = searchFilter();
  } else {
    results = Card.findAll();
  }
  displaySearch(results);
}

function searchFilter() {
  var cards = Card.findAll();
  var searchRegex = new RegExp($('.search').val());
  var results = cards.filter(function(card) {
    return searchRegex.test(card.title) || searchRegex.test(card.body)
  });
  return results;
}

function displaySearch(results) {
  $('main').empty();
  renderCards(results);
}

renderCards(Card.findAll());

