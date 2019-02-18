const SERVER_URL = "http://localhost";
const SERVER_PORT = 5634;

$.ajax( {
    url:SERVER_URL+":"+ SERVER_PORT+"/randomCard",
    type: 'GET'
}).then(response => {
    console.log(response.card.imageUrl);
    $("#card_image").attr('src', response.card.imageUrl);
    $("#card_name").text(response.card.name);
    $("#info_text").text(response.card.text);
    $("#flavor_text").text(response.card.flavor);
});