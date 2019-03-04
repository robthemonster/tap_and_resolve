let currentCard = -1;
let currentFilters = {
    colorExclusive: false,
    colorFlags: {"B": true, "U": true, "G": true, "R": true, "W": true},
    formatFlags: {
        "standard": false,
        "future": false,
        "frontier": false,
        "modern": false,
        "legacy": false,
        "pauper": false,
        "vintage": false,
        "penny": false,
        "commander": false,
        "duel": false,
        "oldschool": false
    },
    allowLands: false,
    commandersOnly: false
};
let [ADD_KEYCODE, SUB_KEYCODE] = [43, 45];

function setButtonConfig(loggedIn) {
    $("#like_button_col").css('display', loggedIn ? 'block' : 'none');
    $("#block_button_col").css('display', loggedIn ? 'block' : 'none');
    let shuffle = $("#shuffle_button_col");
    let filter = $("#filters_button_col");
    if (!loggedIn) {
        shuffle.removeClass("s3").addClass("s6");
        filter.removeClass("s3").addClass("s6");
    } else {
        shuffle.removeClass("s6").addClass("s3");
        filter.removeClass("s6").addClass("s3");
    }
}

function adjustCardButtons() {
    let buttons = [$("#shuffle_button_col"), $('#block_button_col'), $("#like_button_col"), $("#filters_button_col")];
    let buttonsVisible = 0;
    buttons.forEach((button) => {
        buttonsVisible += button.is(':visible') ? 1 : 0
    });

    buttons.forEach((button) => {
        button.removeClass('s3', 's4', 's6', 's12');
    });
    let columnClass = "s" + (Math.floor(12 / buttonsVisible)).toString();
    buttons.forEach((button) => {
        button.addClass(columnClass);
    });
}

function getCheckBox(id, innerHtml, checked, xl) {
    let checkedText = checked ? `checked="checked"` : "";
    let xlText = xl ? "_xl" : "";
    return `<span>                         <label>
                                <input type="checkbox" onchange="handleFiltersChange()" id="${id}_check${xlText}"
                                       ${checkedText} class="flow-text"/>
                                <span>${innerHtml}</span>
                            </label>
                        </span>`
}

function getImgForColor(color) {
    return `<img src="../assets/${color}.png" class="responsive-img">`;
}

function addFilterButtons() {
    for (let color in currentFilters.colorFlags) {
        $("#fullscreen_color_row").append(getCheckBox(color, getImgForColor(color), true, true));
        $("#colors_row").append(getCheckBox(color, getImgForColor(color), true, false));
    }
    for (let format in currentFilters.formatFlags) {
        let formatted = format.substring(0, 1).toUpperCase() + format.substring(1);
        let formatsHtmls = `<span> ${formatted}</span>`;
        $("#fullscreen_formats_row").append(getCheckBox(format, formatsHtmls, false, true));
        $("#formats_row").append(getCheckBox(format, formatsHtmls, false, false));
    }
    let landsHtml = `<span>Lands</span>`;
    $("#types_row").append(getCheckBox('land', landsHtml, false, false));
    $("#fullscreen_types_row").append(getCheckBox('land', landsHtml, false, true));

    let commandersHtml = `<span>Commanders</span>`;
    $("#fullscreen_commanders_row").append(getCheckBox('commanders', commandersHtml, false, true));
    $("#commanders_row").append(getCheckBox('commanders', commandersHtml, false, false));

}

$(document).ready(() => {
    addFilterButtons(currentFilters);
    setButtonConfig(isLoggedIn());
    adjustCardButtons();
    shuffleCard();
    $("body").keypress((event) => {
        if (event.keyCode === ADD_KEYCODE) {
            likeCard();
        } else if (event.keyCode === SUB_KEYCODE) {
            blockCard();
        }
    });
    $(".tooltipped").tooltip({enterDelay: 500});
    $(window).resize(() => {
        handleFiltersChange();
        adjustCardButtons();
    });
});

function loginCallback() {
    setButtonConfig(isLoggedIn());
    resetNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, "#", NAVBAR_REFS.ABOUT);
    restoreModalButtons();
    shuffleCard();
}

function handleModalClose() {
    if (isLoggedIn()) {
        getAccount(true).then(([userid, token]) => {
            setTimeout(() => {
                $.post({
                    url: API_URL + "/getUserCardStatus",
                    data: {userid: userid, token: token, uuid: currentCard}
                })
                    .then(response => {
                        if (response.liked || response.blocked) {
                            shuffleCard();
                        }
                    })
            }, 500);
        });
    }
}

function getSuffix() {
    return $("#fullscreen_filters").is(":visible") ? "_xl" : "";
}

function handleFiltersChange() {
    let suffix = getSuffix();
    for (let color in currentFilters.colorFlags) {
        currentFilters.colorFlags[color] = $(`#${color}_check${suffix}`).prop('checked');
    }
    currentFilters.colorExclusive = $(`#color_filter_mode${suffix}`).prop('checked');
    for (let format in currentFilters.formatFlags) {
        currentFilters.formatFlags[format] = $(`#${format}_check${suffix}`).prop('checked');
    }
    currentFilters.allowLands = $(`#land_check${suffix}`).prop('checked');
    currentFilters.commandersOnly = $(`#commanders_check${suffix}`).prop('checked');
}

function highlightFilterMode() {
    let suffix = getSuffix();
    let checked = $(`#color_filter_mode${suffix}`).prop('checked');
    let [only, exactly] = [$(`#only_span${suffix}`), $(`#exactly_span${suffix}`)];
    let text_color = 'teal-text';
    only.removeClass(checked ? text_color : "");
    only.addClass(!checked ? text_color : "");
    exactly.removeClass(checked ? "" : text_color);
    exactly.addClass(checked ? text_color : '');

}

function openFilters() {
    let [modal] = M.Modal.init($("#modal_filters"), {onCloseEnd: handleFiltersChange});
    modal.open();
}

function likeCard() {
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + ADD_CARD_LIKED_PATH,
            data: {userid: userid, token: token, uuid: currentCard},
        }).then((card) => {
            setCardContent(card);
            gtag('event', 'card_liked', {'event_category': 'draw_page_interaction'});
            setTimeout(shuffleCard, 1000);
        })
    });
}

function blockCard() {
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + ADD_CARD_BLOCKED_PATH,
            data: {userid: userid, token: token, uuid: currentCard},
        }).then((card) => {
            setCardContent(card);
            gtag('event', 'card_disliked', {'event_category': 'draw_page_interaction'});
            setTimeout(shuffleCard, 1000);
        })
    });
}

function hideCard() {
    $("#card_image").attr('src', "");
    $("#card_image_div").css('display', 'none');
    $("#loading_circle").css('display', 'block');
    $("#modal_trigger").attr('disabled', 'disabled');
}

function showCard() {
    $("#modal_trigger").removeAttr('disabled');
    $("#card_image_div").css('display', 'block');
    $("#loading_circle").css('display', 'none');
}

function setCardContent(card) {
    currentCard = card.id;
    let imageurl = (card.image_uris) ? card.image_uris.border_crop : false;
    let image = new Image();
    image.onload = () => {
        $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
        showCard();
    };
    image.src = imageurl;

    let likedRatio = getLikedRatio(card.likedCount, card.dislikedCount);
    $("#liked_ratio").css('width', likedRatio + "%");
    $("#liked_count").text(card.likedCount);
    $("#disliked_count").text(card.dislikedCount);
    setCardModalContent(card);
}

function shuffleCard() {
    currentCard = -1;
    hideCard();
    getAccount(false).then(([userid, token]) => {
        $.post({
            url: API_URL + "/randomCard",
            data: {userid: userid, token: token, filter: JSON.stringify(currentFilters)},
        }).then(randomCard => {
            setCardContent(randomCard);
            gtag('event', 'card_drawn', {'event_category':'draw_page_interaction'});
        });
    });
}