const MODAL_HTML = `<style>
    .footer_button {
        height: 100%;
        width: 95%;
    }

    .footer_column {
        padding-left: 0;
        padding-right: 0;
    }
</style>
<div id="card_modal" class="modal modal-fixed-footer blue-grey darken-2 white-text">
    <div class="modal-content row">
        <div class="center row">
            <img src="#" id="modal_card_image" alt="" class="responsive-img">
        </div>
        <div class="row">
            <div id="card_faces"></div>
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
    <div class="modal-footer blue-grey darken-1 row valign-wrapper" style="margin-bottom: 0;">
        <span id="block_span_modal" class="col s4 center footer_column">
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
            <a href="#" id="modal_block_anchor"
               class="center btn hoverable blue-grey waves-effect red-text footer_button">
                <i id="modal_block_icon" class="material-icons">block</i></a>
        </span>
        <span id="dismiss_span_modal" class="col s4 center footer_column">
            <a href="#" class="center btn blue-grey waves-effect modal-close white-text footer_button"><i
                    class="material-icons">keyboard_arrow_down</i></a>
        </span>
        <span id="like_span_modal" class="col s4 center footer_column">
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
            <a href="#" id="modal_like_anchor"
               class="center btn hoverable blue-grey waves-effect green-text footer_button"><i
                    id="modal_like_icon" class="material-icons">check</i></a>
        </span>
    </div>`;

function setModalContentFromCard(card) {
    setModalTextAndImage(card);
    resetModalButtons(card.id);
}


function showLoadingCirclesOnModalButtons() {
    let [block_loader, like_loader] = [$("#modal_block_loader"), $('#modal_like_loader')];
    let [block_anchor, like_anchor] = [$("#modal_block_anchor"), $('#modal_like_anchor')];
    block_loader.css('display', 'inline-block');
    like_loader.css('display', 'inline-block');
    block_anchor.css('display', 'none');
    like_anchor.css('display', 'none');
}

function showModalButtons() {
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
    like_anchor.attr("onclick", response.liked ? `unlikeByUuid("${uuid}")` : `likeByUuid("${uuid}")`);
    block_anchor.attr('onclick', response.blocked ? `unblockByUuid("${uuid}")` : `blockByUuid("${uuid}")`);
    like_icon.text(response.liked ? 'undo' : 'check');
    block_icon.text(response.blocked ? 'undo' : 'block');
}

function hideModalButtons() {
    $("#like_span_modal").css('display', 'none');
    $("#block_span_modal").css('display', 'none');
    $("#dismiss_span_modal").removeClass('s3').addClass('s12');
}

function restoreModalButtons() {
    $("#like_span_modal").css('display', 'inline');
    $("#block_span_modal").css('display', 'inline');
    $("#dismiss_span_modal").removeClass('s12').addClass('s3');
}

function resetModalButtons(uuid) {
    showLoadingCirclesOnModalButtons();
    if (isLoggedIn()) {
        getAccount(true).then(([userid, token]) => {
            $.post({
                url: `${API_URL}/getUserCardStatus`,
                data: {userid: userid, token: token, uuid: uuid}
            })
                .then(response => {
                    showModalButtons();
                    changeButtonFunctions(response, uuid);
                });
        }).catch((error) => {
            console.log(error);
        });
    } else {
        hideModalButtons();
        changeButtonFunctions({blocked: false, liked: false}, uuid);
    }
}

function getFaceNameAndText(name, text, flavor) {
    return `<h4 class="row header flow-text">${name}</h4>
<div class="row">
    <p>${text}</p>
    <p>${flavor}</p>
</div>`;
}


function appendCardFaceText(face) {
    let facediv = $("#card_faces");
    facediv.append($(getFaceNameAndText(face.name, face.oracle_text ? face.oracle_text : "", face.flavor_text ? face.flavor_text : "")));
}

function setModalTextAndImage(card) {
    $("#card_faces").empty();
    if (card.card_faces) {
        card.card_faces.forEach(face => {
            appendCardFaceText(face);
        })
    } else {
        appendCardFaceText(card);
    }
    let cardImage = $("#modal_card_image");
    if (card.image_uris) {
        cardImage.attr('src', card.image_uris.border_crop ? card.image_uris.border_crop : IMAGE_NOT_AVAILABLE);
    } else {
        cardImage.attr('src', IMAGE_NOT_AVAILABLE);
    }
    $.get(card.uri)
        .then(response => {
            let prices = response.prices;
            let [usd, foil, tix] = [prices['usd'], prices['usd_foil'], prices['usd_foil']];
            $("#modal_card_usd").text(usd !== null ? `$${usd}` : "");
            $("#modal_card_foil").text(foil !== null ? `$${foil} foil` : "");
            $("#modal_card_tix").text(tix !== null ? `${tix} TIX` : "");

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

$("body").append($(MODAL_HTML));
