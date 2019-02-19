const API_URL = "https://api.tapandresolve.tk";
shuffleCard();
function shuffleCard() {
    console.log(window.netlifyIdentity.currentUser());
    $.ajax({
        url: API_URL + "/randomCard",
        data:{'uid':window.netlifyIdentity.currentUser()},
        type: 'GET'
    }).then(response => {
        console.log(response.card.imageUrl);
        $("#card_image").attr('src', response.card.imageUrl);
        $("#card_name").text(response.card.name);
        $("#info_text").text(response.card.text);
        $("#flavor_text").text(response.card.flavor);
    });
}