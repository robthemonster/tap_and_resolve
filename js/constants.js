function getNetlifyIdentity() {
    return window.netlifyIdentity;
}

function getLikedRatio(liked, disliked) {
    if (liked + disliked === 0) {
        return 50;
    } else {
        return 100 * (liked / (liked + disliked));
    }
}

const API_URL = "https://api.tapandresolve.tk";
const [ADD_CARD_LIKED_PATH, ADD_CARD_BLOCKED_PATH, DEL_CARD_LIKED_PATH, DEL_CARD_BLOCKED_PATH] = ["/addCardToLiked", "/addCardToBlocked", "/removeCardFromLiked", "/removeCardFromBlocked"];
const IMAGE_NOT_AVAILABLE = "../assets/image_not_found.png";

function isLoggedIn() {
    return getNetlifyIdentity() && getNetlifyIdentity().currentUser();
}

function crudToEndpoint(endPoint, uuid) {
    gtag('event', endPoint, {'event_category': 'modal_interaction'});
    showLoadingCirclesOnModalButtons();
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + endPoint,
            data: {userid: userid, token:token, uuid: uuid}
        })
            .then(card => {
                setModalLikedRatio(card.likedCount, card.dislikedCount);
                resetModalButtons(card.id);
            });
    });
}

async function getAccount(forceLogin) {
    return new Promise((resolve, reject) => {
        if (isLoggedIn()) {
            getNetlifyIdentity().currentUser().jwt().then(token => {
                resolve([getNetlifyIdentity().currentUser().id, token])
            });
        } else if (forceLogin) {
            setTimeout(() => {
                if (!getNetlifyIdentity()) {
                    setTimeout(() => {
                        getAccount(true);
                    }, 1000);
                    reject([undefined, undefined]);
                }
                getNetlifyIdentity().on('login', loginCallback);
                getNetlifyIdentity().open();
            }, 1000);
        } else {
            resolve([undefined, undefined]);
        }
    });
}

function logout() {
    if (isLoggedIn()) {
        getNetlifyIdentity().currentUser().logout();
        location.reload();
    }
}

