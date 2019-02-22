const API_URL = "https://api.tapandresolve.tk";
const SCRYFALL_API = "https://api.scryfall.com";
const IMAGE_NOT_AVAILABLE = "./image_not_found.png";
const MAX_SEARCH_RESULT_IMAGES = 25;
const MODAL_HTML = `<div id="card_modal" class="modal modal-fixed-footer blue-grey darken-2 white-text">
    <div class="modal-content row">
        <div class="center row">
            <img src="#" id="modal_card_image" alt="" class="responsive-img">
        </div>
        <div class="row">
            <h4 id="modal_card_name" class="row header flow-text"></h4>
            <div class="row">
                <p id="modal_card_text" class=""></p>
                <p id="modal_card_flavor" class=""></p>
            </div>
            <div>
                <h3 class="header flow-text">Prices</h3>
                <p id="modal_card_usd"></p>
                <p id="modal_card_foil"></p>
                <p id="modal_card_tix"></p>
                <h3 class="header flow-text">Purchase</h3>
                <p><a target="_blank" id="modal_cardhoarder_link"></a><a target="_blank" id="modal_cardmarket_link"></a><a
                        target="_blank" id="modal_tcgplayer_link"></a></p>
            </div>
        </div>
    </div>
    <div class="modal-footer blue-grey darken-3 row">
        <span class="col s4 center">
            <div id="modal_block_loader" class="preloader-wrapper small active">
                <div class="spinner-layer ">
                  <div class="circle-clipper left">
                    <div class="circle"></div>
                  </div><div class="gap-patch">
                    <div class="circle"></div>
                  </div><div class="circle-clipper right">
                    <div class="circle"></div>
                  </div>
                </div>
            </div>
            <a href="#" id="modal_block_anchor" class="center btn hoverable blue-grey waves-effect red-text" style="height:100%;width:100%;"><i
                    id="modal_block_icon" class="material-icons">block</i></a>
        </span>
        <span class="col s4 center">
            <a href="#" class="col s4 center btn blue-grey waves-effect modal-close white-text" style="height:100%;width:100%;"><i
                    class="material-icons">keyboard_arrow_down</i></a>
            </span>
        <span class="col s4 center" >
            <div id="modal_like_loader" class="preloader-wrapper small active">
                <div class="spinner-layer ">
                  <div class="circle-clipper left">
                    <div class="circle"></div>
                  </div><div class="gap-patch">
                    <div class="circle"></div>
                  </div><div class="circle-clipper right">
                    <div class="circle"></div>
                  </div>
                </div>
            </div>
            <a href="#" id="modal_like_anchor"  style="width:100%;height:100%;"  class="center btn hoverable blue-grey waves-effect green-text" ><i
                    id="modal_like_icon" class="material-icons">check</i></a>
        </span>
    </div>
</div>`;

function getNavBarHtml(likedRef, blockedRef, searchRef, homeRef) {
    return `<nav id="navbar">
    <div class="nav-wrapper blue-grey darken-2">
    <a href="${homeRef}" class="brand-logo center">Tap&Resolve</a>
    <a href="#" data-target="mobile-demo" class="sidenav-trigger"><i class="material-icons">menu</i></a>
<ul class="right hide-on-med-and-down">
    <li><a href="${likedRef}"><i class="material-icons green-text">check</i></a></li>
<li><a href="${blockedRef}"><i class="material-icons red-text">block</i></a></li>
<li><a href="${searchRef}"><i class="material-icons prefix">search</i></a></li>
</ul>
</div>
</nav>

<ul class="sidenav" id="mobile-demo">
    <li><a href="${likedRef}"><i style="width:100%;" class="center-align material-icons green-text">check</i></a></li>
<li><a href="${blockedRef}"><i style="width:100%;" class="center-align material-icons red-text">block</i></a></li>
<li><a href="${searchRef}"><i style="width: 100%" class="center-align material-icons prefix">search</i></a></li>
</ul>`
}


$("body").append($(MODAL_HTML));

function addNavBar(likedRef, blockedRef, searchRef, homeRef) {
    $("body").prepend($(getNavBarHtml(likedRef, blockedRef, searchRef, homeRef)));
}

$(document).ready(function () {
    $('.sidenav').sidenav();
});
$(document).ready(function () {
    $('.modal').modal({
        onCloseEnd: handleModalClose
    });
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

function setModalContentFromPageIndex(page, index) {
    let card = cards[page][index];
    setModalContentFromCard(card);
}


function setModalTextAndImage(card) {
    $("#modal_card_name").text(card.name);
    $("#modal_card_text").text(card.oracle_text);
    $("#modal_card_flavor").text(card.flavor_text);
    $("#modal_card_image").attr('src', card.image_uris.border_crop);
    $.get(card.uri)
        .then(response => {
            console.log(response);
            let prices = response.prices;
            let [usd, foil, tix] = [prices['usd'], prices['usd_foil'], prices['usd_foil']];
            $("#modal_card_usd").text(usd !== null ? "$" + usd : "");
            $("#modal_card_foil").text(foil !== null ? "$" + foil + " foil" : "");
            $("#modal_card_tix").text(tix !== null ? tix + " TIX" : "");

            let purchase_uris = response.purchase_uris;
            let [cardhoarder, cardmarket, tcgplayer] = [purchase_uris['cardhoarder'], purchase_uris['cardmarket'], purchase_uris['tcgplayer']];
            let [cardhoarder_link, cardmarket_link, tcgplayer_link] = [$("#modal_cardhoarder_link"), $("#modal_cardmarket_link"), $("#modal_tcgplayer_link")];
            cardhoarder_link.text(cardhoarder !== null ? "Cardhoarder " : "");
            cardmarket_link.text(cardmarket !== null ? "Cardmarket " : "");
            tcgplayer_link.text(tcgplayer !== null ? "TCGPlayer" : "");
            cardhoarder_link.attr("href", cardhoarder);
            cardmarket_link.attr("href", cardmarket);
            tcgplayer_link.attr("href", tcgplayer);
        });
}

function setModalContentFromCard(card) {
    setModalTextAndImage(card);
    resetModalButtons(card.id);
}

function hideButtons() {
    let [block_loader, like_loader] = [$("#modal_block_loader"), $('#modal_like_loader')];
    let [block_anchor, like_anchor] = [$("#modal_block_anchor"), $('#modal_like_anchor')];
    block_loader.css('display', 'inline-block');
    like_loader.css('display', 'inline-block');
    block_anchor.css('display', 'none');
    like_anchor.css('display', 'none');
}

function showButtons() {
    let [block_loader, like_loader] = [$("#modal_block_loader"), $('#modal_like_loader')];
    let [block_anchor, like_anchor] = [$("#modal_block_anchor"), $('#modal_like_anchor')];
    block_loader.css('display', 'none');
    like_loader.css('display', 'none');
    block_anchor.css('display', 'inline-block');
    like_anchor.css('display', 'inline-block');
}

function changeButtonFunctions(response, uuid) {
    let [block_anchor, like_anchor] = [$("#modal_block_anchor"), $('#modal_like_anchor')];
    let [block_icon, like_icon] = [$("#modal_block_icon"), $("#modal_like_icon")];
    like_anchor.attr("onclick", response.liked ? 'unlikeByUuid(\"' + uuid + "\")" : "likeByUuid(\"" + uuid + "\")");
    block_anchor.attr('onclick', response.blocked ? 'unblockByUuid(\"' + uuid + "\")" : 'blockByUuid(\"' + uuid + "\")");
    like_icon.text(response.liked ? 'undo' : 'check');
    block_icon.text(response.blocked ? 'undo' : 'block');
}

function resetModalButtons(uuid) {
    hideButtons();
    $.post({
        url: API_URL + "/getUserCardStatus",
        data: {userid: getUserId(), uuid: uuid}
    })
        .then(response => {
            console.log(response);
            showButtons();
            changeButtonFunctions(response, uuid);
        });
}

function crudToEndpoint(endPoint, uuid) {
    hideButtons();
    $.post({
        url: API_URL + endPoint,
        data: {userid: getUserId(), uuid: uuid}
    })
        .then(response => {
            resetModalButtons(uuid);
        });
}

function likeByUuid(uuid) {
    crudToEndpoint("/addCardToLiked", uuid);
}

function blockByUuid(uuid) {
    crudToEndpoint("/addCardToBlocked", uuid);
}

function unlikeByUuid(uuid) {
    crudToEndpoint("/removeCardFromLiked", uuid);

}

function unblockByUuid(uuid) {
    crudToEndpoint("/removeCardFromBlocked", uuid);
}

function getUserId() {
    return "TESTFUCK";
    if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
        id = window.netlifyIdentity.currentUser().id;
    }
}

