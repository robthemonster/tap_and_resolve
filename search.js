let cards = [];
let resultsReturnedFor = null;

function filterCards() {
    $("#results_collection").empty();
    let queryString = $("#autocomplete-input").val();
    queryString = (queryString) ? queryString.toString().toLowerCase() : undefined;
    if (!queryString || queryString === resultsReturnedFor) {
        return;
    }
    $.post({
        url: API_URL + "/searchForCard",
        data: {searchString: queryString, userid: TEST_USER_ID}
    }).then(response => {
        cards = response.results;
        resultsReturnedFor = queryString;
        $("#autocomplete-input").autocomplete({
            data: response.autocomplete,
            limit: 10,
            minLength: 3,
            onAutocomplete: filterCards,
            sortFunction: (a, b, search) => {
                return a.indexOf(search) - b.indexOf(search)
            }
        });
        for (let index in cards) {
            let uuid = cards[index].id;
            let imageurl = (cards[index].image_uris) ? cards[index].image_uris.border_crop : false;
            let name = cards[index].name;
            if (cards.length < MAX_SEARCH_RESULT_IMAGES) {
                let outerAnchor = $("<a>", {
                    class: "collection-item row modal-trigger",
                    id: uuid + "_collection_item",
                    onclick: 'setModalContent(\"' + uuid + '\")',
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
                $("#results_collection").append(outerAnchor);
            }
        }
    })
}