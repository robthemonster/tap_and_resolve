const API_URL = "https://api.tapandresolve.tk";
const MTG_API_URL = "https://api.magicthegathering.io/v1";


function getLoadingCircle(uuid) {
    // language=HTML
    return `<span  id="${uuid}_loading_circle" class="col s8 l2 valign-wrapper" style="height: 100%">
            <div class="preloader-wrapper big active center-block">
                <div class="spinner-layer spinner-blue-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
                </div>
            </div>
        </span>`;
}

$(document).ready(function () {
    $('.sidenav').sidenav();
});
$(document).ready(function () {
    $('.modal').modal();
});

let cards = {};
let filterReady = false;

let id = "TESTFUCK";
if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    id = window.netlifyIdentity.currentUser().id;
}
$.post({
    url: API_URL + "/getLiked",
    data: {'userid': id}
}).then(liked => {
    let autocomplete = {};
    liked.forEach(card => {
        let uuid = card.uuid;
        let name = card.name;
        cards[uuid] = {uuid: uuid, name: name};
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
            class: "col s8 l2 center-align img_column",
            id: uuid + "_card_img_container"
        });
        let cardImg = $("<img>", {
            class: "responsive-img",
            id: uuid + "_card_img"
        });
        let loadingCircle = $(getLoadingCircle(uuid));

        cardNameSpan.append(cardNameInner);
        cardImageSpan.append(cardImg);
        outerAnchor.append(cardNameSpan, loadingCircle);
        $("#liked_collection").append(outerAnchor);
        $.get({
            url: MTG_API_URL + "/cards/" + uuid
        }).then(response => {
            //  $("#" + uuid + "_card_name").text(response.card.name);
            cards[uuid] = response.card;
            cardImg.attr('src', response.card.imageUrl);
            $("#" + uuid + "_loading_circle").remove();
            $("#" + uuid + "_collection_item").append(cardImageSpan);
        });
    });
    let autocomplete_input = $("#autocomplete-input");
    autocomplete_input.autocomplete({
        data: autocomplete,
        onAutocomplete: filterCards
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