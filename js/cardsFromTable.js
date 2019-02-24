let cards = {};
let filterReady = false;
let TABLE_REF = $("#TABLE_REF").val();
let endpoint = "";
let likedRef, blockedRef;
if (TABLE_REF === "LIKED") {
    endpoint = "/getLiked";
    likedRef = "#";
    blockedRef = "blocked.html";
} else if (TABLE_REF === "BLOCKED") {
    endpoint = "/getBlocked";
    blockedRef = "#";
    likedRef = "liked.html";
}
$(document).ready(() => {
    addNavBarAndLogin(likedRef, blockedRef, "search.html", "draw.html");
    fetchAndDisplayCards();
});

function handleModalClose() {
    setTimeout(fetchAndDisplayCards, 500);
}

function loginCallback() {
    fetchAndDisplayCards();
}

function fetchAndDisplayCards() {
    let cardCollection = $("#card_collection");
    cardCollection.empty();
    $.post({
        url: API_URL + endpoint,
        data: {'userid': getUserId(true)}
    }).then(response => {
        let autocomplete = {};
        response.forEach(card => {
            let uuid = card.id;
            let name = card.name;
            let imageurl = card.image_uris ? card.image_uris.border_crop : false;
            cards[uuid] = card;
            autocomplete[name] = null;
            let outerAnchor = $("<a>", {
                class: "collection-item row modal-trigger blue-grey darken-2 white-text",
                id: uuid + "_collection_item",
                onclick: 'setModalContentFromIndex(\"' + uuid + '\")',
                href: "#card_modal"
            });
            let cardNameSpan = $("<span>", {
                class: "col s4 l4 offset-l4 flow-text valign-wrapper card_name_column",
                id: uuid + "_card_name_outer"
            });
            let cardNameInner = $("<span>", {
                class: "card_name_inner",
                id: uuid + "_card_name",
                text: name
            });
            let cardImageSpan = $("<span>", {
                class: "col s8 l4 center-align img_column",
                id: uuid + "_card_img_container"
            });
            let cardImg = $("<img>", {
                class: "responsive-img",
                id: uuid + "_card_img",
                src: (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE
            });
            cardNameSpan.append(cardNameInner);
            cardImageSpan.append(cardImg);
            outerAnchor.append(cardNameSpan, cardImageSpan);
            cardCollection.append(outerAnchor);
        });
        let autocomplete_input = $("#autocomplete-input");
        autocomplete_input.autocomplete({
            data: autocomplete,
            onAutocomplete: filterCards,
            sortFunction: (a, b) => (a < b ? -1 : 1)
        });
        autocomplete_input.removeAttr("disabled");
        filterReady = true;
        filterCards();
    });
}

function filterCards() {
    if (!filterReady) {
        return;
    }
    let querystring = $("#autocomplete-input").val().toString().toLowerCase();
    for (let uuid in cards) {
        let name = cards[uuid].name.toLowerCase();
        $("#" + uuid + "_collection_item").css('display', name.includes(querystring) ? 'block' : 'none');

    }
}