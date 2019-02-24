let cards = [];
let resultsReturnedFor = null;
const PAGE_SIZE = 50;

$(document).ready(() => {
    addNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, "#", NAVBAR_REFS.DRAW, NAVBAR_REFS.ABOUT);
});
function handleModalClose() {
}

function loginCallback() {
    filterCards();
}

function filterCards() {
    let queryString = $("#autocomplete-input").val();
    queryString = (queryString) ? queryString.toString().toLowerCase() : undefined;
    $.post({
        url: API_URL + "/searchForCard",
        data: {searchString: queryString, pagesize: PAGE_SIZE}
    }).then(response => {
        let resultsCollection = $("#results_collection");
        resultsCollection.empty();
        cards = response.results;
        resultsReturnedFor = queryString;
        $("#autocomplete-input").autocomplete({
            data: response.autocomplete,
            limit: 10,
            minLength: 3,
            onAutocomplete: filterCards,
            sortFunction: (a, b, search) => {
                return a.toLowerCase().indexOf(search) - b.toLowerCase().indexOf(search)
            }
        });
        for (let i = 0; i < PAGE_SIZE && i < cards[0].length; i++) {
            let uuid = cards[0][i].id;
            let imageurl = (cards[0][i].image_uris) ? cards[0][i].image_uris.border_crop : false;
            let name = cards[0][i].name;
            let outerAnchor = $("<a>", {
                class: "collection-item row modal-trigger blue-grey darken-2 white-text",
                id: uuid + "_collection_item",
                onclick: 'setModalContentFromPageIndex(0,\"' + i + '\")',
                href: "#card_modal"
            });
            let cardNameSpan = $("<span>", {
                class: "col s4 l4 offset-l4 flow-text valign-wrapper card_name_column"
            });
            let cardNameInner = $("<span>", {
                class: "card_name_inner",
                text: name
            });
            let cardImageSpan = $("<span>", {
                class: "col s8 l4 center-align img_column",
            });
            cardNameSpan.append(cardNameInner);
            outerAnchor.append(cardNameSpan);
            let cardImg = $("<img>", {
                class: "responsive-img",
                id: uuid + "_card_img",
                src: (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE
            });
            cardImageSpan.append(cardImg);
            outerAnchor.append(cardImageSpan);
            resultsCollection.append(outerAnchor);
        }
    })
}