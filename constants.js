const API_URL = "https://api.tapandresolve.tk";
const SCRYFALL_API = "https://api.scryfall.com";
const IMAGE_NOT_AVAILABLE = "./image_not_found.png";
const MAX_SEARCH_RESULT_IMAGES = 25;
const TEST_USER_ID = "TESTFUCK";
const MODAL_HTML = `<div id="card_modal" class="modal blue-grey darken-2 white-text">
    <div class="modal-content row">
        <div class="col s6">
            <h4 id="modal_card_name" class="row header flow-text"></h4>
            <div class="row">
                <p id="modal_card_text" class=""></p>
                <p id="modal_card_flavor" class=""></p>
            </div>
        </div>
        <img src="#" id="modal_card_image" alt="" class="col s6 responsive-img">

    </div>
    <div class="modal-footer blue-grey darken-3">
        <a href="#" class="modal-close white-text">Close</a>
    </div>
</div>`;

$("body").append($(MODAL_HTML));

$(document).ready(function () {
    $('.sidenav').sidenav();
});
$(document).ready(function () {
    $('.modal').modal();
});
$(".autocomplete").keydown((event) => {
    if (event.keyCode === 27) {
        let instance = M.Autocomplete.getInstance($(".autocomplete"));
        instance.close();
    }
});

function setModalContentFromIndex(index) {
    let card = cards[index];
    console.log(index);
    setModalContentFromCard(card);
}

function setModalContentFromPageIndex(page,index) {
    let card = cards[page][index];
    setModalContentFromCard(card);
}


function setModalContentFromCard(card) {
    console.log(card);
    $("#modal_card_name").text(card.name);
    $("#modal_card_text").text(card.oracle_text);
    $("#modal_card_flavor").text(card.flavor_text);
    $("#modal_card_image").attr('src', card.image_uris.border_crop);
}

