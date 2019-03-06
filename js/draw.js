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
    allowLands: true,
    allowBasicLands: true,
    commandersOnly: false,
    excludedSets: [],
    excludeSilly: false,
    excludePromos: false,
    excludeDigital: false,
    excludeTokens: false
};
const [LANDS_ID, BASICS_ID, TOKENS_ID, DIGITALS_ID, PROMOS_ID, SILLY_ID, COMMANDERS_ID, COLOR_FILTER_MODE_ID] = ['lands', 'basics',
    'tokens', 'digitals', 'promos', 'sillys', 'commanders', 'color_filter_mode'];
let sets = {};
let [ADD_KEYCODE, SUB_KEYCODE] = [43, 45];

function setButtonConfig(loggedIn) {
    $("#like_button_col").css('display', loggedIn ? 'block' : 'none');
    $("#block_button_col").css('display', loggedIn ? 'block' : 'none');
    $("#login_suggestion_div").css('display', loggedIn ? "none" : "block");
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

function getCheckBox(id, innerHtml, checked, xl, outerTagType = "span", outerClassString = "") {
    let checkedText = checked ? `checked="checked"` : "";
    let xlText = xl ? "_xl" : "";
    return `<${outerTagType} id="${id}_check_outer_tag${xlText}" class="${outerClassString}">                         <label>
                                <input type="checkbox" onchange="handleFiltersChange()" id="${id}_check${xlText}"
                                       ${checkedText} class="flow-text"/>
                                <span class="white-text">${innerHtml}</span>
                            </label>
                        </${outerTagType}>`
}

function getImgForColor(color) {
    return `<img src="../assets/${color}.png" class="responsive-img">`;
}

function addFilterButtons() {
    for (let color in currentFilters.colorFlags) {
        const checked = currentFilters.colorFlags[color];
        $("#fullscreen_color_row").append(getCheckBox(color, getImgForColor(color), checked, true));
        $("#colors_row").append(getCheckBox(color, getImgForColor(color), checked, false));
    }
    for (let format in currentFilters.formatFlags) {
        let checked = currentFilters.formatFlags[format]
        let formatted = format.substring(0, 1).toUpperCase() + format.substring(1);
        let formatsHtmls = `<span> ${formatted}</span>`;
        $("#fullscreen_formats_row").append(getCheckBox(format, formatsHtmls, checked, true));
        $("#formats_row").append(getCheckBox(format, formatsHtmls, checked, false));
    }

    function appendTypeCheck(typeId, name, checked) {
        let typesRow = $("#types_row");
        let xlTypesRow = $("#fullscreen_types_row");
        typesRow.append(getCheckBox(typeId, `<span>Allow ${name}</span>`, checked, false));
        xlTypesRow.append(getCheckBox(typeId, `<span>Allow ${name}</span>`, checked, true));
    }


    appendTypeCheck(LANDS_ID, 'Lands', currentFilters.allowLands);
    appendTypeCheck(BASICS_ID, 'Basic Lands', currentFilters.allowBasicLands);
    appendTypeCheck(TOKENS_ID, 'Tokens', !currentFilters.excludeTokens);
    appendTypeCheck(DIGITALS_ID, 'Digital Cards', !currentFilters.excludeDigital);
    appendTypeCheck(PROMOS_ID, "Promotional Cards", !currentFilters.excludePromos);
    appendTypeCheck(SILLY_ID, "Silly Cards", !currentFilters.excludeSilly);

    let commandersHtml = `<span>Commanders only</span>`;
    $("#fullscreen_commanders_row").append(getCheckBox(COMMANDERS_ID, commandersHtml, currentFilters.commandersOnly, true));
    $("#commanders_row").append(getCheckBox(COMMANDERS_ID, commandersHtml, currentFilters.commandersOnly, false));
    $.post({url: API_URL + "/getSetCodes"}).then(setsResponse => {
        let autocomplete = {};
        sets = setsResponse;
        sets.forEach(set => {
            let setHtml = `<span>${set.name}</span>`;
            $("#sets_row").append(getCheckBox(`${set.code}`, setHtml, true, false, "div", "collection-item blue-grey"));
            $("#fullscreen_sets_row").append(getCheckBox(`${set.code}`, setHtml, true, true, "div", "collection-item blue-grey "));
            autocomplete[set.name] = null;
        });
        $("#fullscreen_set_autocomplete").autocomplete({
            data: autocomplete,
            onAutocomplete: changeSetFilter,
            limit: 8,
            oninput: changeSetFilter
        });
    })

}

function changeSetFilter() {
    let suffix = getSuffix();
    let filter = $(suffix === "" ? "#set_autocomplete" : "#fullscreen_set_autocomplete").val().toString().toLowerCase();
    sets.forEach(set => {
        $(`#${set.code}_check_outer_tag${suffix}`).css('display', set.name.toLowerCase().includes(filter) ? "block" : "none");
    });
}

function selectAllSets(setBool = true) {
    let suffix = getSuffix();
    sets.forEach(set => {
        $(`#${set.code}_check${suffix}`).prop('checked', setBool);
    });
    handleFiltersChange();
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
    resetNavBarAndLogin();
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

    function isChecked(id) {
        return $(`#${id}_check${suffix}`).prop('checked');
    }

    for (let color in currentFilters.colorFlags) {
        currentFilters.colorFlags[color] = isChecked(color);
    }
    currentFilters.colorExclusive = isChecked(COLOR_FILTER_MODE_ID);
    for (let format in currentFilters.formatFlags) {
        currentFilters.formatFlags[format] = isChecked(format);
    }
    currentFilters.allowLands = isChecked(LANDS_ID);
    currentFilters.allowBasicLands = isChecked(BASICS_ID);
    currentFilters.commandersOnly = isChecked(COMMANDERS_ID);
    currentFilters.excludedSets = [];
    sets.forEach(set => {
        if (!isChecked(set.code)) {
            currentFilters.excludedSets.push(set.code);
        }
    });
    currentFilters.excludeSilly = !isChecked(SILLY_ID);
    currentFilters.excludePromos = !isChecked(PROMOS_ID);
    currentFilters.excludeDigital = !isChecked(DIGITALS_ID);
    currentFilters.excludeTokens = !isChecked(TOKENS_ID);
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

function shuffleCard(buttonPress = false) {
    currentCard = -1;
    hideCard();
    getAccount(false).then(([userid, token]) => {
        $.post({
            url: API_URL + "/randomCard",
            data: {userid: userid, token: token, filter: JSON.stringify(currentFilters)},
        }).then(randomCard => {
            setCardContent(randomCard);
            if (buttonPress) {
                gtag('event', 'card_drawn', {'event_category': 'draw_page_interaction'});
            }
        });
    });
}