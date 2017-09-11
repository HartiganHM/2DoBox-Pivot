//****Event Listeners****
$(document).on('blur', '.card-title', editCardTitle);
$(document).on('blur', '.card-body', editCardBody);
$('.clear-all-button').on('click', clearAllIdeas);
$('.save-button').on('click', createIdeaCard);

$('.user-title, .user-body').on('keyup', enableSaveButton);
$('.search').on('keyup', searchIdeas);
$('main').on('click', '.delete', deleteIdeaCard);
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
  this.qualityIndex = object.qualityIndex || 0 ;
}

function createIdeaCard(event) {
  event.preventDefault();
  var title = $('.user-title').val();
  var body = $('.user-body').val();
  var theIdea = new Card({title, body});
  displayIdeaCard(theIdea);
  storeIdeaCard(theIdea);
}

function displayIdeaCard(theIdea) {
  $('main').prepend(ideaCardTemplate(theIdea));
  resetInputs();
}

function storeIdeaCard(theIdea) {
  Card.create(theIdea);
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

function ideaCardTemplate(idea) {
  $('main').prepend(
      `
        <article id=${idea.id}>
          <h2 contenteditable=true class="card-title">${idea.title}</h2>
          <button class="delete"></button>
          <p contenteditable=true class="card-body">${idea.body}</p>
          <button class="up-vote"></button>
          <button class="down-vote"></button>
          <p class="quality">quality: </p><p class="level">${idea.getQuality()}</p>
        </article>
      `
    )
}

function renderCards(cards = []) {
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('main').append(ideaCardTemplate(card));
  }
}

function clearAllIdeas(event) {
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
  var qualityArray = ['swill', 'plausible', 'genius'];
  return qualityArray[this.qualityIndex];
}

Card.prototype.incrementQuality = function() {
  var qualityArray = ['swill', 'plausible', 'genius'];
  if (this.qualityIndex !== qualityArray.length - 1) {
    this.qualityIndex += 1;
  }
}

Card.prototype.decrementQuality = function() {
  if (this.qualityIndex !== 0) {
    this.qualityIndex -= 1;
  }
}

function deleteIdeaCard(event) {
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

function searchIdeas() {
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

