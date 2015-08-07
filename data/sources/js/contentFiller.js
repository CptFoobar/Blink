var CARD_TEMPLATE =     "<div class='card medium'>" +
                          "<div class='card-image'>" +
                            "<img class='responsive-img blink-img' src='%imgsrc%'></img>" +
                            "<span class='card-title tinted-title'>%cardtitle%</span>" +
                          "</div>" +
                          "<div class='card-content'>" +
                          "<p>%cardcontent%</p>" +
                          "</div>" +
                          "<div class='card-action'>" +
                            "<a href='%cardlink%' target='_blank'>Read More</a>" +
                          "</div>" +
                        "</div>";

function addContent(url) {
  console.log("Parsing feed from: " + url);
  var container = document.getElementById('cards-container');
  $.ajax({
    url:'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + 
        encodeURIComponent(url),
    dataType: 'json',
    success: function(data) {
      $.each(data.responseData.feed.entries, function(key, value) {
        var title = capitaliseFirstLetter(value.title);
        var imageSource = getImageSource(value.content);
        var contentSnippet = value.contentSnippet;
        var link = value.link;
        // create card
        var cardsource = newHope(title, imageSource, contentSnippet, link);
        var card = document.createElement('div');
        card.setAttribute("class", "col s12 m4");
        card.appendChild(cardsource);
        container.appendChild(card);
      });
    }
  });
}

function getImageSource(source) {
  var div = document.createElement("div");
  div.innerHTML = source;
  var imgsrc = div.getElementsByTagName('img')[0].src;
  if(imgsrc.length > 5 && imgsrc.indexOf("rc.feedsportal.com") == -1) {
      console.log(imgsrc);
      return imgsrc;
    }
  else return "resource://@blink/data/icons/default_icon.jpg"
}

function getContentHeader(content) {
  var div = document.createElement("div");
  div.innerHTML = content;
  var text = div.textContent || div.innerText || "";
  return text;
}

/**
 * Capitalizes the first letter of any string variable
 * source: http://stackoverflow.com/a/1026087/477958
 */
function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function newHope(title, imageSource, contentSnippet, link) {
    var card = document.createElement('div');
    card.setAttribute("class", "card medium");
    var cardSource = CARD_TEMPLATE;
    cardSource = cardSource.replace("%cardtitle%", title);
    cardSource = cardSource.replace("%imgsrc%", imageSource);
    cardSource = cardSource.replace("%cardcontent%", contentSnippet);
    cardSource = cardSource.replace("%cardlink%", link);
    var parser = new DOMParser(), 
      doc = parser.parseFromString(cardSource, "text/html");
    var x = doc.body.firstChild;
    x.style.margin="-1px 0px 0px 0px";
    card.appendChild(x);
    return card;
}