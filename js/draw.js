let currentCard = -1;
let currentFilters = {exclusive: false, flags: {B: true, U: true, G: true, R: true, W: true}};
$(document).ready(() => {
    addNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, "#", NAVBAR_REFS.ABOUT);
    shuffleCard();
});

function handleModalClose() {
    setTimeout(() => {
        $.post({
            url: API_URL + "/getUserCardStatus",
            data: {userid: getUserId(false), uuid: currentCard}
        })
            .then(response => {
                if (response.liked || response.blocked) {
                    shuffleCard();
                }
            })
    }, 500);
}

function handleFiltersChange() {
    let exclusive = $("#color_filter_mode").prop('checked');
    let [B_check, U_check, G_check, R_check, W_check] = [$("#B_check"), $("#U_check"), $("#G_check"), $("#R_check"), $("#W_check")];

    currentFilters.flags['B'] = B_check.prop("checked");
    currentFilters.flags['U'] = U_check.prop("checked");
    currentFilters.flags['G'] = G_check.prop("checked");
    currentFilters.flags['R'] = R_check.prop("checked");
    currentFilters.flags['W'] = W_check.prop("checked");
    currentFilters.exclusive = exclusive;
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
    $.post({
        url: API_URL + "/addCardToLiked",
        data: {'userid': getUserId(true), 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function blockCard() {
    $.post({
        url: API_URL + "/addCardToBlocked",
        data: {'userid': getUserId(true), 'uuid': currentCard},
    }).then(() => {
        shuffleCard();
    })
}

function loginCallback() {
    shuffleCard();
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
    $.post({
        url: API_URL + "/randomCard",
        data: {'userid': getUserId(false), 'filter': JSON.stringify(currentFilters)},
    }).then(randomCard => {
        currentCard = randomCard.id;
        let imageurl = (randomCard.image_uris) ? randomCard.image_uris.border_crop : false;
        $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
        setModalContentFromCard(randomCard);
        showCard();
    });
}