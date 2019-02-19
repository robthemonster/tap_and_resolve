$.ajax( {
    url:"https://api.tapandresolve.tk/randomCard",
    type: 'GET'
}).then(response => {
    console.log(response.card.imageUrl);
    $("#card_image").attr('src', response.card.imageUrl);
    $("#card_name").text(response.card.name);
    $("#info_text").text(response.card.text);
    $("#flavor_text").text(response.card.flavor);
});