let currentCard = -1;
let currentFilters = {
    colorExclusive: false,
    colorFlags: {"B": true, "U": true, "G": true, "R": true, "W": true},
    formatFlags: {
        "standard": false,
        "future": false,
        "frontier": false,
        "modern": false,
        "legacy": false,
        "pauper": false,
        "vintage": false,
        "penny": false,
        "commander": false,
        "duel": false,
        "oldschool": false
    }
};
let [ADD_KEYCODE, SUB_KEYCODE] = [43, 45];

function setButtonConfig(loggedIn) {
    $("#like_button_col").css('display', loggedIn ? 'block' : 'none');
    $("#block_button_col").css('display', loggedIn ? 'block' : 'none');
    let shuffle = $("#shuffle_button_col");
    let filter = $("#filters_button_col");
    if (!loggedIn) {
        shuffle.removeClass("s3").addClass("s6");
        filter.removeClass("s3").addClass("s6");
    } else {
        shuffle.removeClass("s6").addClass("s3");
        filter.removeClass("s6").addClass("s3");
    }
}

$(document).ready(() => {
    addNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, "#", NAVBAR_REFS.ABOUT);
    setButtonConfig(isLoggedIn());
    shuffleCard();
    $("body").keypress((event) => {
        if (event.keyCode === ADD_KEYCODE) {
            likeCard();
        } else if (event.keyCode === SUB_KEYCODE) {
            blockCard();
        }
    })
});

function loginCallback() {
    setButtonConfig(isLoggedIn());
    resetNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, "#", NAVBAR_REFS.ABOUT);
    restoreModalButtons();
    shuffleCard();
}

function handleModalClose() {
    if (isLoggedIn()) {
        getAccount(true).then(([userid, token]) => {
            setTimeout(() => {
                $.post({
                    url: API_URL + "/getUserCardStatus",
                    data: {userid: userid, token: token, uuid: currentCard}
                })
                    .then(response => {
                        if (response.liked || response.blocked) {
                            shuffleCard();
                        }
                    })
            }, 500);
        });
    }
}

function handleFiltersChange() {
    for (let color in currentFilters.color) {
        currentFilters.color[color] = $(`#${color}_check`).prop('checked');
    }
    currentFilters.colorExclusive = $("#color_filter_mode").prop('checked');
    for (let format in currentFilters.formatFlags) {
        currentFilters.formatFlags[format] = $(`#${format}_check`).prop('checked');
    }
}

function highlightFilterMode() {
    let checked = $("#color_filter_mode").prop('checked');
    let [only, exactly] = [$("#only_span"), $("#exactly_span")];
    let text_color = 'teal-text';
    only.removeClass(checked ? text_color : "");
    only.addClass(!checked ? text_color : "");
    exactly.removeClass(checked ? "" : text_color);
    exactly.addClass(checked ? text_color : '');

}

function openFilters() {
    let [modal] = M.Modal.init($("#modal_filters"), {onCloseEnd: handleFiltersChange});
    modal.open();
}

function likeCard() {
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + "/addCardToLiked",
            data: {userid: userid, token: token, uuid: currentCard},
        }).then(() => {
            shuffleCard();
        })
    });
}

function blockCard() {
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + "/addCardToBlocked",
            data: {userid: userid, token: token, uuid: currentCard},
        }).then(() => {
            shuffleCard();
        })
    });
}

function hideCard() {
    $("#card_image_div").css('display', 'none');
    $("#loading_circle").css('display', 'block');
    $("#modal_trigger").attr('disabled', 'disabled');
}

function showCard() {
    $("#modal_trigger").removeAttr('disabled');
    $("#card_image_div").css('display', 'block');
    $("#loading_circle").css('display', 'none');
}

function shuffleCard() {
    currentCard = -1;
    hideCard();
    getAccount(false).then(([userid, token]) => {
        $.post({
            url: API_URL + "/randomCard",
            data: {userid: userid, token: token, filter: JSON.stringify(currentFilters)},
        }).then(randomCard => {
            currentCard = randomCard.id;
            let imageurl = (randomCard.image_uris) ? randomCard.image_uris.border_crop : false;
            $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
            setModalContentFromCard(randomCard);
            showCard();
        });
    });
}