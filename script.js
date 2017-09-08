//****Global Variables****
var inputTitle = $('.user-title');
var inputBody = $('.user-body');
var cardTitle = $('.card-title');
var cardBody = $('.card-body');



var qualityArray = ['swill', 'plausible', 'genius'];

//****Event Listeners****

$(document).on('blur', '.output-title', editCardTitle);
$(document).on('blur', '.output-body', editCardBody);
$('.clear-all-button').on('click', clearAllIdeas);
$('.save-button').on('click', createIdeaCard);
(inputTitle, inputBody).on('keyup', enableSaveButton);
$('.search').on('keyup', searchIdeas);
$('main').on('click', '.delete', deleteIdeaCard);
$('main').on('click', '.up-vote', voteUp);
$('main').on('click', '.down-vote', voteDown);

//****Functions****

function enableSaveButton() {
  if(inputTitle.val() !== "" && inputBody.val() !== "") {
    $('.save-button').removeAttr('disabled');
  } else {
    $('.save-button').attr('disabled', true)
  }
};

function Card(params) {
  this.title = params.title;
  this.body = params.body;
  this.id = params.id || Date.now();
  this.qualityIndex = params.qualityIndex || 0 ;
};

function createIdeaCard(event) {
  event.preventDefault();
  var title = $('.input-title').val();
  var body = $('.input-body').val();
  var theIdea = new Card({title, body});
  $('.bottom-container').prepend(ideaCardTemplate(theIdea));
  Card.create(theIdea);
  $('.input-title').val("");
  $('.input-body').val("");
  $('.input-title').focus();
  $('.save-button').attr("disabled", true);
};

Card.create = function(card) {
  localStorage.setItem(card.id, JSON.stringify(card));
};

function ideaCardTemplate(idea) {
  $('.bottom-container').prepend(
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
};

function renderCards(cards = []) {
  for ( var i = 0; i < cards.length; i++) {
    var card = cards[i];
    $('.bottom-container').append(ideaCardTemplate(card));
  }
};

function clearAllIdeas(event) {
  event.preventDefault();
  var allArticles = $('article');
  if (allArticles.length !== 0){
    allArticles.remove();
    localStorage.clear();
    $('.input-title').focus();
  }
};

function editCardTitle(event){
  event.preventDefault();
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  var card = Card.find(id);
  card.title = $(event.target).text();
  card.save();
};

function editCardBody(event){
  event.preventDefault();
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  var card = Card.find(id);
  card.body = $(event.target).text();
  card.save();
};

function voteUp(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article')
  var id = articleElement.prop('id');
  var card = Card.find(id);
  card.incrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
};

function voteDown(event) {
  event.preventDefault();
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  var card = Card.find(id);
  card.decrementQuality();
  card.save();
  articleElement.find('.level').text(card.getQuality());
};

Card.prototype.getQuality = function() {
  return qualityArray[this.qualityIndex];
};

Card.prototype.incrementQuality = function() {
  if (this.qualityIndex !== qualityArray.length - 1) {
    this.qualityIndex += 1;
  }
};

Card.prototype.decrementQuality = function() {
  if (this.qualityIndex !== 0) {
    this.qualityIndex -= 1;
  }
};

function deleteIdeaCard(event) {
  var articleElement = $(event.target).closest('article');
  var id = articleElement.prop('id');
  articleElement.remove();
  Card.delete(id);
};

Card.delete = function(id) {
  localStorage.removeItem(id);
};

Card.prototype.save = function() {
  Card.create(this);
};

Card.find = function(id) {
  return new Card(JSON.parse(localStorage.getItem(id)));
};

Card.findAll = function() {
  var values = [],
  keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      values.push(new Card(JSON.parse(localStorage.getItem(keys[i]))));
    }
    return values;
};

function searchIdeas() {
  var searchEngineValue = $('.search').val();
  var results
  if (searchEngineValue !== "") {
    var cards = Card.findAll();
    console.log(Card.findAll())
    var searchRegex = new RegExp(searchEngineValue);
    results = cards.filter(function(card) {
      console.log()
      return searchRegex.test(card.title) || searchRegex.test(card.body)
    })
  } else {
    results = Card.findAll();
  }
    $('.bottom-container').empty();
    renderCards(results)
};

renderCards(Card.findAll())
