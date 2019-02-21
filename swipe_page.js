let currentCard = -1;
shuffleCard();

$(document).ready(function(){
    $('.sidenav').sidenav();
});

function likeCard() {
    $.post({
        url: API_URL + "/addCardToLiked",
        data: {'userid': TEST_USER_ID, 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function blockCard() {
    $.post({
        url: API_URL + "/addCardToBlocked",
        data: {'userid': TEST_USER_ID, 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function shuffleCard() {
    if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
        id = window.netlifyIdentity.currentUser().id;
    }
    $.post({
        url: API_URL + "/randomCard",
        data: {'userid': TEST_USER_ID},
    }).then(randomCard => {
        currentCard = randomCard.uuid;
        $("#card_name").text(randomCard.name);
        $("#info_text").text(randomCard.text);
        $("#flavor_text").text(randomCard.flavor);
        $.get({
            url: MTG_API_URL + "/cards/" + randomCard.uuid,
        }).then(response => {
            console.log(response.card.imageUrl);
            $("#card_image").attr('src', response.card.imageUrl);
        });
    });
}