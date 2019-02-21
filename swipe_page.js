let currentCard = -1;
shuffleCard();

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
    currentCard = -1;
    $("#card_image_div").css('display', 'none');
    $("#loading_circle").css('display', 'block');
    $.post({
        url: API_URL + "/randomCard",
        data: {'userid': TEST_USER_ID},
    }).then(randomCard => {
        currentCard = randomCard.id;
        $("#card_name").text(randomCard.name);
        $("#info_text").text(randomCard.text);
        $("#flavor_text").text(randomCard.flavor);

        $("#card_image_div").css('display', 'block');
        $("#loading_circle").css('display', 'none');
        let imageurl = randomCard.image_uris.normal;
        $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
    });
}