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
    }
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

function getCheckBox(id, innerHtml, checked) {
    let checkedText = checked ? `checked="checked"` : "";
    return `<span>                         <label>
                                <input type="checkbox" onchange="handleFiltersChange()" id="${id}_check_xl"
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
        let checkbox = getCheckBox(color, getImgForColor(color), true);
        $("#fullscreen_color_row").append(checkbox);
        $("#colors_row").append(checkbox);
    }
    for (let format in currentFilters.formatFlags) {
        let formatted = format.substring(0, 1).toUpperCase() + format.substring(1);
        let checkbox = getCheckBox(format, `<span> ${formatted}</span>`, false);
        $("#fullscreen_formats_row").append(checkbox);
        $("#formats_row").append(checkbox);
    }
}

$(document).ready(() => {
    addNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, "#", NAVBAR_REFS.ABOUT);
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

function handleFiltersChange() {
    let suffix = "";
    if ($("#fullscreen_filters").is(":visible")) {
        suffix = "_xl";
    }
    for (let color in currentFilters.colorFlags) {
        currentFilters.colorFlags[color] = $(`#${color}_check${suffix}`).prop('checked');
    }
    currentFilters.colorExclusive = $(`#color_filter_mode${suffix}`).prop('checked');
    for (let format in currentFilters.formatFlags) {
        currentFilters.formatFlags[format] = $(`#${format}_check${suffix}`).prop('checked');
    }
}

function highlightFilterMode() {
    let checked = $("#color_filter_mode").prop('checked');
    let [only, exactly] = [$("#only_span"), $("#exactly_span")];
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
            url: API_URL + "/addCardToLiked",
            data: {userid: userid, token: token, uuid: currentCard},
        }).then(() => {
            shuffleCard();
        })
    });
}

function blockCard() {
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + "/addCardToBlocked",
            data: {userid: userid, token: token, uuid: currentCard},
        }).then(() => {
            shuffleCard();
        })
    });
}

function hideCard() {
    $("#card_image_div").css('display', 'none');
    $("#loading_circle").css('display', 'block');
    $("#modal_trigger").attr('disabled', 'disabled');
}

function showCard() {
    $("#modal_trigger").removeAttr('disabled');
    $("#card_image_div").css('display', 'block');
    $("#loading_circle").css('display', 'none');
}

function shuffleCard() {
    currentCard = -1;
    hideCard();
    getAccount(false).then(([userid, token]) => {
        $.post({
            url: API_URL + "/randomCard",
            data: {userid: userid, token: token, filter: JSON.stringify(currentFilters)},
        }).then(randomCard => {
            currentCard = randomCard.id;
            let imageurl = (randomCard.image_uris) ? randomCard.image_uris.border_crop : false;
            $("#card_image").attr('src', (imageurl) ? imageurl : IMAGE_NOT_AVAILABLE);
            setModalContentFromCard(randomCard);
            showCard();
        });
    });
}