const API_URL = "https://api.tapandresolve.tk";
const IMAGE_NOT_AVAILABLE = "../assets/image_not_found.png";
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
        <span class="col s4 center footer_column">
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
        <span class="col s4 center footer_column">
            <a href="#" class="center btn blue-grey waves-effect modal-close white-text footer_button"><i
                    class="material-icons">keyboard_arrow_down</i></a>
        </span>
        <span class="col s4 center footer_column">
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
    </div>
</div>`;

function isLoggedIn() {
    let x = !!(window.netlifyIdentity && window.netlifyIdentity.currentUser());
    console.log(x);
    return x;
}


function getNavBarHtml(likedRef, blockedRef, searchRef, homeRef) {
    function getNavClass() {
        let results = [];
        for (let i in arguments) {
            results[i] = arguments[i] === "#" ? " blue darken-1" : "";
        }
        return results;
    }

    function getAccountDropdown() {
        if (!isLoggedIn()) {
            return ['', ''];
        } else {
            let email = window.netlifyIdentity.currentUser().email;
            email = email ? email : "Account";
            let dropdown = `<li><a class="dropdown-trigger" href="#!" data-target="account_dropdown_list">${email}<i
        class="material-icons right">arrow_drop_down</i></a>
</li>`;
            let list = `<ul id="account_dropdown_list" class="dropdown-content">
    <li><a href="#!" onclick="logout();" >logout</a></li>
</ul>   `;
            return [list, dropdown];
        }
    }

    let [likedClass, blockedClass, searchClass, homeClass] = getNavClass(likedRef, blockedRef, searchRef, homeRef);

    let [accountDropdownList, accountDropdown] = getAccountDropdown();
    return `
<nav id="navbar">
${accountDropdownList}
    <div class="nav-wrapper blue-grey darken-2">
        <a href="${homeRef}" class="brand-logo center">Tap&Resolve</a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"><i class="material-icons">menu</i></a>
        <ul class="right hide-on-med-and-down">
            <li class="${likedClass}"><a href="${likedRef}"><i
                    class="material-icons green-text ${likedClass}">check</i></a></li>
            <li class="${blockedClass}"><a href="${blockedRef}"><i
                    class="material-icons red-text ${blockedClass}">block</i></a></li>
            <li class="${searchClass}"><a href="${searchRef}"><i
                    class="material-icons prefix ${searchClass}">search</i></a></li>
            ${accountDropdown}
        </ul>
    </div>
</nav>
<ul class="sidenav" id="mobile-demo">
    <li class="${likedClass}"><a href="${likedRef}"><i style="width:100%;"
                                                                 class="center-align material-icons green-text">check</i></a>
    </li>
    <li class="${blockedClass}"><a href="${blockedRef}"><i style="width:100%;"
                                                                 class="center-align material-icons red-text">block</i></a>
    </li>
    <li class="${searchClass}"><a href="${searchRef}"><i style="width: 100%"
                                                                 class="center-align material-icons prefix">search</i></a>
    </li>
</ul>`
}

function getFaceNameAndText(name, text, flavor) {
    return `<h4 class="row header flow-text">${name}</h4>
<div class="row">
    <p>${text}</p>
    <p>${flavor}</p>
</div>`;
}

$("body").append($(MODAL_HTML));

function addNavBarAndLogin(likedRef, blockedRef, searchRef, homeRef) {
    $("body").prepend($(getNavBarHtml(likedRef, blockedRef, searchRef, homeRef)));
    $(".dropdown-trigger").dropdown();
}

$(document).ready(function () {
    $('.sidenav').sidenav();
    $('.modal').modal({
        onCloseEnd: handleModalClose
    });
    $(".autocomplete").keydown((event) => {
        if (event.keyCode === 27) {
            let instance = M.Autocomplete.getInstance($(".autocomplete"));
            instance.close();
        }
    });
});

function setModalContentFromIndex(index) {
    let card = cards[index];
    setModalContentFromCard(card);
}

function setModalContentFromPageIndex(page, index) {
    let card = cards[page][index];
    setModalContentFromCard(card);
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
    like_anchor.attr("onclick", response.liked ? `unlikeByUuid(${uuid})` : `likeByUuid(${uuid})`);
    block_anchor.attr('onclick', response.blocked ? `unblockByUuid(${uuid})` : `blockByUuid(${uuid})`);
    like_icon.text(response.liked ? 'undo' : 'check');
    block_icon.text(response.blocked ? 'undo' : 'block');
}

function resetModalButtons(uuid) {
    hideButtons();
    if (isLoggedIn()) {
        $.post({
            url: `${API_URL}/getUserCardStatus`,
            data: {userid: getUserId(true), uuid: uuid}
        })
            .then(response => {
                showButtons();
                changeButtonFunctions(response, uuid);
            });
    } else {
        showButtons();
        changeButtonFunctions({blocked: false, liked: false}, uuid);
    }
}

function crudToEndpoint(endPoint, uuid) {
    hideButtons();
    $.post({
        url: API_URL + endPoint,
        data: {userid: getUserId(true), uuid: uuid}
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

function getUserId(forceLogin) {
    if (isLoggedIn()) {
        return window.netlifyIdentity.currentUser().id;
    } else if (forceLogin) {
        setTimeout(() => {
            if (!window.netlifyIdentity) {
                setTimeout(() => {
                    getUserId(true);
                }, 1000);
                return;
            }
            window.netlifyIdentity.on('login', loginCallback);
            M.Modal.getInstance($("#card_modal")).close();
            window.netlifyIdentity.open();
            hideButtons();
            showButtons();
        }, 1000);
    } else {
        return undefined;
    }
}

function logout() {
    if (isLoggedIn()) {
        window.netlifyIdentity.currentUser().logout();
        location.reload();
    }
}

