
let cards = {};
let filterReady = false;

if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    id = window.netlifyIdentity.currentUser().id;
}
$.post({
    url: API_URL + "/getLiked",
    data: {'userid': TEST_USER_ID}
}).then(liked => {
    let autocomplete = {};
    liked.forEach(card => {
        let uuid = card.id;
        let name = card.name;
        let imageurl = card.image_uris ? card.image_uris.border_crop : false;
        cards[uuid] = card;
        autocomplete[name] = null;
        let outerAnchor = $("<a>", {
            class: "collection-item row modal-trigger",
            id: uuid + "_collection_item",
            onclick: 'setModalContent(\"' + uuid + '\")',
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
            src: (imageurl)? imageurl : IMAGE_NOT_AVAILABLE
        });
        cardNameSpan.append(cardNameInner);
        cardImageSpan.append(cardImg);
        outerAnchor.append(cardNameSpan, cardImageSpan);
        $("#liked_collection").append(outerAnchor);
    });
    let autocomplete_input = $("#autocomplete-input");
    autocomplete_input.autocomplete({
        data: autocomplete,
        onAutocomplete: filterCards,
        sortFunction: (a,b) => (a < b ? -1 : 1)
    });
    autocomplete_input.removeAttr("disabled");
    filterReady = true;
});

function setModalContent(uuid) {
    $("#modal_card_name").text(cards[uuid].name);
}

function filterCards() {
    if (!filterReady) {
        return;
    }
    let querystring = $("#autocomplete-input").val().toString().toLowerCase();
    for (let uuid in cards) {
        let name = cards[uuid].name.toLowerCase();
        $("#" + uuid + "_collection_item").css('display', name.startsWith(querystring) ? 'block' : 'none');

    }
}