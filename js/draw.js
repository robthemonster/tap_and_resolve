let currentCard = -1;
const DEFAULT_FILTERS = {
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
    excludeTokens: false,
    rarityExclusions: {
        uncommon: false,
        common: false,
        rare: false,
        mythic: false
    },
    artist: ""
};
let currentFilters = DEFAULT_FILTERS;
const [LANDS_ID, BASICS_ID, TOKENS_ID, DIGITALS_ID, PROMOS_ID, SILLY_ID, COMMANDERS_ID, COLOR_FILTER_MODE_ID] = ['lands', 'basics',
    'tokens', 'digitals', 'promos', 'sillys', 'commanders', 'color_filter_mode'];
const COMMON_ID = "common", UNCOMMON_ID = "uncommon", RARE_ID = "rare", MYTHIC_ID = "mythic";
let sets = {};
let artists = new Set();
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
    $("#color_filter_mode_check").prop('checked', currentFilters.colorExclusive);
    $("#color_filter_mode_check_xl").prop('checked', currentFilters.colorExclusive);
    highlightFilterMode();
    for (let format in currentFilters.formatFlags) {
        let checked = currentFilters.formatFlags[format];
        let formatted = format.substring(0, 1).toUpperCase() + format.substring(1);
        let formatsHtmls = `<span> ${formatted}</span>`;
        $("#fullscreen_formats_row").append(getCheckBox(format, formatsHtmls, checked, true));
        $("#formats_row").append(getCheckBox(format, formatsHtmls, checked, false));
    }

    function appendCheck(div_name, typeId, innerText, checked) {
        let typesRow = $(`#${div_name}`);
        let xlTypesRow = $(`#fullscreen_${div_name}`);
        typesRow.append(getCheckBox(typeId, `<span>${innerText}</span>`, checked, false));
        xlTypesRow.append(getCheckBox(typeId, `<span>${innerText}</span>`, checked, true));
    }

    let types_div = "types_row";
    appendCheck(types_div, LANDS_ID, 'Allow Lands', currentFilters.allowLands);
    appendCheck(types_div, BASICS_ID, 'Allow Basic Lands', currentFilters.allowBasicLands);
    appendCheck(types_div, TOKENS_ID, 'Allow Tokens', !currentFilters.excludeTokens);
    appendCheck(types_div, DIGITALS_ID, 'Allow Digital Cards', !currentFilters.excludeDigital);
    appendCheck(types_div, PROMOS_ID, "Allow Promotional Cards", !currentFilters.excludePromos);
    appendCheck(types_div, SILLY_ID, "Allow Silly Cards", !currentFilters.excludeSilly);

    let rarities_div = "rarities_row";
    appendCheck(rarities_div, COMMON_ID, "Common", !currentFilters.rarityExclusions.common);
    appendCheck(rarities_div, UNCOMMON_ID, "Uncommon", !currentFilters.rarityExclusions.uncommon);
    appendCheck(rarities_div, RARE_ID, "Rare", !currentFilters.rarityExclusions.rare);
    appendCheck(rarities_div, MYTHIC_ID, "Mythic", !currentFilters.rarityExclusions.mythic);

    let commandersHtml = `<span>Draw Commanders only</span>`;
    $("#fullscreen_commanders_row").append(getCheckBox(COMMANDERS_ID, commandersHtml, currentFilters.commandersOnly, true));
    $("#commanders_row").append(getCheckBox(COMMANDERS_ID, commandersHtml, currentFilters.commandersOnly, false));
    let excludedSetsSet = new Set(currentFilters.excludedSets);
    $.post({url: API_URL + "/getSetCodes"}).then(setsResponse => {
        let autocomplete = {};
        sets = setsResponse;
        sets.forEach(set => {
            let setHtml = `<span>${set.name}</span>`;
            let checked = !excludedSetsSet.has(set.code);
            $("#sets_row").append(getCheckBox(`${set.code}`, setHtml, checked, false, "div", "collection-item blue-grey"));
            $("#fullscreen_sets_row").append(getCheckBox(`${set.code}`, setHtml, checked, true, "div", "collection-item blue-grey "));
            autocomplete[set.name] = null;
        });
        $("#fullscreen_set_autocomplete").autocomplete({
            data: autocomplete,
            onAutocomplete: changeSetFilter,
            limit: 8,
            oninput: changeSetFilter
        });
    });
    $.post({url: API_URL + "/getArtistNames"}).then(artistNames => {
        let autoComplete = {};
        artistNames.forEach(artist => {
            autoComplete[artist] = null;
            artists.add(artist);
        });
        console.log(autoComplete);
        const options = {
            data: autoComplete,
            onAutocomplete: handleFiltersChange,
            limit: 4,
            oninput: "handleFiltersChange()"
        };
        $("#fullscreen_artists_autocomplete").autocomplete(options);
        $("#artists_autocomplete").autocomplete(options);
        $("#fullscreen_artists_autocomplete").val(currentFilters.artist);
        $("#artists_autocomplete").val(currentFilters.artist);
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

function getPrefix() {
    return $("#fullscreen_filters").is(":visible") ? "fullscreen_" : "";
}

function getOffPrefix() {
    return !$("#fullscreen_filters").is(":visible") ? "fullscreen_" : "";

}

function getSuffix() {
    return $("#fullscreen_filters").is(":visible") ? "_xl" : "";
}

function getOffSuffix() {
    return $("#fullscreen_filters").is(":visible") ? "" : "_xl";

}

function handleFiltersChange() {
    let suffix = getSuffix();
    let offSuffix = getOffSuffix();

    function isChecked(id) {
        let checked = $(`#${id}_check${suffix}`).prop('checked');
        $(`#${id}_check${offSuffix}`).prop('checked', checked);
        return checked;
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
    currentFilters.rarityExclusions.common = !isChecked(COMMON_ID);
    currentFilters.rarityExclusions.uncommon = !isChecked(UNCOMMON_ID);
    currentFilters.rarityExclusions.rare = !isChecked(RARE_ID);
    currentFilters.rarityExclusions.mythic = !isChecked(MYTHIC_ID);

    let artist_autocomplete = $(`#${getPrefix()}artists_autocomplete`);
    let off_autocomplete = $(`#${getOffPrefix()}artists_autocomplete`);
    let artistVal = artist_autocomplete.val();
    off_autocomplete.val(artistVal);
    console.log(artistVal);
    if (artists.has(artistVal) || artistVal === "") {
        currentFilters.artist = artistVal;
    }

    document.cookie = "filters=" + JSON.stringify(currentFilters);
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function highlightFilterMode() {
    let suffix = getSuffix();
    let offSuffix = getOffSuffix();
    let checked = $(`#${COLOR_FILTER_MODE_ID}_check${suffix}`).prop('checked');
    let [only, exactly, onlyOff, exactlyOff] = [$(`#only_span${suffix}`), $(`#exactly_span${suffix}`), $(`#only_span${offSuffix}`), $(`#exactly_span${offSuffix}`)];
    let text_color = 'teal-text';
    only.removeClass(checked ? text_color : "");
    only.addClass(!checked ? text_color : "");
    onlyOff.removeClass(checked ? text_color : "");
    onlyOff.addClass(!checked ? text_color : "");
    exactly.removeClass(checked ? "" : text_color);
    exactly.addClass(checked ? text_color : '');
    exactlyOff.removeClass(checked ? "" : text_color);
    exactlyOff.addClass(checked ? text_color : '');

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

function resetFiltersToDefault() {
    document.cookie = "filters=";
    location.reload();
}

$(document).ready(() => {
    let filtersCookie = getCookie("filters");
    try {
        currentFilters = JSON.parse(filtersCookie);
        if (JSON.stringify(Object.keys(currentFilters).sort()) !== JSON.stringify(Object.keys(DEFAULT_FILTERS).sort())) {
            currentFilters = DEFAULT_FILTERS;
        }
    } catch (e) {
        currentFilters = DEFAULT_FILTERS;
    }
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