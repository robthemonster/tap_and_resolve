const API_URL = "https://api.tapandresolve.tk";
const MTG_API_URL = "https://api.magicthegathering.io/v1";
let currentCard = -1;
shuffleCard();

$(document).ready(function(){
    $('.sidenav').sidenav();
});

function likeCard() {
    let id = "TESTFUCK";
    $.post({
        url: API_URL + "/addCardToLiked",
        data: {'userid': id, 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function blockCard() {
    let id = "TESTFUCK";
    $.post({
        url: API_URL + "/addCardToBlocked",
        data: {'userid': id, 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function shuffleCard() {
    let id = "TESTFUCK";
    if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
        id = window.netlifyIdentity.currentUser().id;
    }
    $.post({
        url: API_URL + "/randomCard",
        data: {'userid': id},
    }).then(randomUuid => {
        $.get({
            url: MTG_API_URL + "/cards/" + randomUuid,
        }).then(response => {
            currentCard = response.card.id;
            console.log(response.card.imageUrl);
            $("#card_image").attr('src', response.card.imageUrl);
            $("#card_name").text(response.card.name);
            $("#info_text").text(response.card.text);
            $("#flavor_text").text(response.card.flavor);
            if (response.card.imageUrl === undefined) {
                setTimeout(shuffleCard, 500);
            }
        });
    });
}