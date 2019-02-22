let currentCard = -1;
addNavBarAndLogin("liked.html", "blocked.html", "search.html", "#");

function handleModalClose() {
    setTimeout(() => {
        $.post({
            url: API_URL + "/getUserCardStatus",
            data: {userid: getUserId(), uuid: currentCard}
        })
            .then(response => {
                if (response.liked || response.blocked) {
                    shuffleCard();
                }
            })
    }, 500);
}

shuffleCard();

function likeCard() {
    $.post({
        url: API_URL + "/addCardToLiked",
        data: {'userid': getUserId(), 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function blockCard() {
    $.post({
        url: API_URL + "/addCardToBlocked",
        data: {'userid': getUserId(), 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function loginCallback() {
    shuffleCard();
}

function shuffleCard() {
    currentCard = -1;
    $("#card_image_div").css('display', 'none');
    $("#loading_circle").css('display', 'block');
    $("#modal_trigger").attr('disabled', 'disabled');
    let userid = getUserId();
    if (!userid) {
        return;
    }
    $.post({
        url: API_URL + "/randomCard",
        data: {'userid': getUserId()},
    }).then(randomCard => {
        currentCard = randomCard.id;
        setModalContentFromCard(randomCard);
        $("#modal_trigger").removeAttr('disabled');
        $("#card_name").text(randomCard.name);
        $("#card_image_div").css('display', 'block');
        $("#loading_circle").css('display', 'none');
        let imageurl = (randomCard.image_uris) ? randomCard.image_uris.border_crop : false;
        $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
    });
}