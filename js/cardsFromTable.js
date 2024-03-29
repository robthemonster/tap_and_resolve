let cards = {};
let filterReady = false;
let TABLE_REF = $("#TABLE_REF").val();
let endpoint = "";
let sortType = "TOP";
const SORT_TYPES = {'top': 'TOP', 'controversial': 'CONTROVERSIAL', 'worst': 'WORST'};
const [LIKED_PAGE_KEY, BLOCKED_PAGE_KEY, TOP_CARDS_PAGE_KEY, SEARCH_PAGE_KEY] = ["LIKED", "BLOCKED", "TOP_CARDS", "SEARCH"];
const ENDPOINTS = {
    'LIKED': "/getLiked",
    'BLOCKED': "/getBlocked",
    'TOP_CARDS': "/getTopCards",
    'SEARCH': "/searchForCard"
};
endpoint = ENDPOINTS[TABLE_REF];

$(document).ready(() => {
    let autocomplete = $("#autocomplete-input");
    autocomplete.keydown((event) => {
        if (event.keyCode === 27) {
            let instance = M.Autocomplete.getInstance($(".autocomplete"));
            instance.close();
        }
    });
    fetchAndDisplayCards();
});

function changeSortType() {
    let sortValue = $("input[type='radio']:checked").val();
    sortType = SORT_TYPES[sortValue];
    fetchAndDisplayCards();
}

function handleModalClose() {
    fetchAndDisplayCards();
}

function loginCallback() {
    resetNavBarAndLogin();
    restoreModalButtons();
    fetchAndDisplayCards();
}

function setModalContentFromIndex(index) {
    let card = cards[index];
    setCardModalContent(card);
}

function fetchCardsPromise() {
    return new Promise((resolve, reject) => {
        if (TABLE_REF === LIKED_PAGE_KEY || TABLE_REF === BLOCKED_PAGE_KEY) {
            getAccount(true).then(([userid, token]) => {
                $.post({
                    url: API_URL + endpoint,
                    data: {userid: userid, token: token}
                }).then((results) => {
                    resolve(results)
                });
            }).catch(() => {
                reject();
            });
        } else if (TABLE_REF === TOP_CARDS_PAGE_KEY) {
            $.post({
                url: API_URL + endpoint,
                data: {sort: sortType}
            }).then(results => {
                resolve(results)
            });
        } else if (TABLE_REF === SEARCH_PAGE_KEY) {
            let queryString = $("#autocomplete-input").val();
            queryString = (queryString) ? queryString.toString().toLowerCase() : undefined;
            $.post({
                url: API_URL + endpoint,
                data: {searchString: queryString, pageSize: 50, pageNumber: 0}
            }).then(results => {
                resolve(results.cards);
            })
        }
    });
}

function fetchAndDisplayCards() {
    let cardCollection = $("#card_collection");
    fetchCardsPromise().then(results => {
        cardCollection.empty();
        let autocomplete = {};
        results.forEach(card => {
            let uuid = card.id;
            let name = card.name;
            let imageurl = card.image_uris ? card.image_uris.border_crop : false;
            cards[uuid] = card;
            if (Object.keys(autocomplete).length < 8) {
                autocomplete[name] = null;
            }
            let outerAnchor = $("<a>", {
                class: "collection-item row modal-trigger blue-grey darken-2 white-text",
                id: `${uuid}_collection_item`,
                onclick: `setModalContentFromIndex("${uuid}")`,
                href: "#card_modal"
            });
            let likedRatioDiv = $("<div>", {
                class: 'center-align valign-wrapper col s4 white-text row',
                style: 'height:100%;margin:auto;'
            });
            let likedRationValignDiv = $("<div>", {
                    class: "center",
                    style: "width:100%"
                }
            );
            let likedRatioBarDiv = $("<div>", {
                class: "progress red"
            });
            let likeRatioInnerDiv = $("<div>", {
                class: "determinate green",
                style: `width:${getLikedRatio(card.likedCount, card.dislikedCount)}%`
            });
            likedRatioBarDiv.append(likeRatioInnerDiv);
            let likedCountText = $(`<span class="green-text col s6 center">${card.likedCount}</span>`);
            let dislikedCountText = $(`<span class="red-text col s6 center">${card.dislikedCount}</span>`);
            likedRationValignDiv.append(likedRatioBarDiv, likedCountText, dislikedCountText);
            likedRatioDiv.append(likedRationValignDiv);

            let cardNameSpan = $("<span>", {
                class: "col s4 flow-text valign-wrapper card_name_column",
                id: uuid + "_card_name_outer"
            });
            let cardNameInner = $("<span>", {
                class: "card_name_inner",
                id: uuid + "_card_name",
                text: name
            });
            let cardImageSpan = $("<span>", {
                class: "col s4 center-align img_column",
                id: uuid + "_card_img_container"
            });
            let cardImg = $("<img>", {
                class: "responsive-img",
                id: uuid + "_card_img",
                src: (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE
            });
            cardNameSpan.append(cardNameInner);
            cardImageSpan.append(cardImg);
            outerAnchor.append(likedRatioDiv, cardNameSpan, cardImageSpan);
            cardCollection.append(outerAnchor);
        });
        if (TABLE_REF === LIKED_PAGE_KEY || TABLE_REF === BLOCKED_PAGE_KEY || TABLE_REF === SEARCH_PAGE_KEY) {
            let autocomplete_input = $("#autocomplete-input");
            autocomplete_input.autocomplete({
                data: autocomplete,
                onAutocomplete: filterCards,
                sortFunction: (a, b) => (a < b ? -1 : 1),
                limit: 8,
                minLength: 3
            });
            autocomplete_input.removeAttr("disabled");
            filterReady = true;
            filterCards();
        }
    }).catch((error) => {
        console.log(error);
    });
}

function filterCards() {
    if (!filterReady) {
        return;
    }
    const autocompleteEl = $("#autocomplete-input");
    let querystring = autocompleteEl.val().toString().toLowerCase();
    let autocomplete = {};
    for (let uuid in cards) {
        let name = cards[uuid].name.toLowerCase();
        $("#" + uuid + "_collection_item").css('display', name.includes(querystring) ? 'block' : 'none');
        if (name.includes(querystring) && Object.keys(autocomplete).length < 8) {
            autocomplete[name] = null;
        }
    }
    autocompleteEl.autocomplete({
        data: autocomplete,
        onAutocomplete: filterCards,
        sortFunction: (a, b) => (a < b ? -1 : 1),
        limit: 8,
        minLength: 3
    });
}