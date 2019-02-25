function getNetlifyIdentity() {
    return window.netlifyIdentity;
}

const API_URL = "https://api.tapandresolve.tk";
const IMAGE_NOT_AVAILABLE = "../assets/image_not_found.png";
function isLoggedIn() {
    return getNetlifyIdentity() && getNetlifyIdentity().currentUser();
}

function crudToEndpoint(endPoint, uuid) {
    showLoadingCirclesOnModalButtons();
    getAccount(true).then(([userid, token]) => {
        $.post({
            url: API_URL + endPoint,
            data: {userid: userid, token, uuid: uuid}
        })
            .then(response => {
                resetModalButtons(uuid);
            });
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
                M.Modal.getInstance($("#card_modal")).close();
                getNetlifyIdentity().open();
                showLoadingCirclesOnModalButtons();
                showModalButtons();
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

