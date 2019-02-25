function getNetlifyIdentity() {
    return window.netlifyIdentity;
}

const API_URL = "https://api.tapandresolve.tk";
const IMAGE_NOT_AVAILABLE = "../assets/image_not_found.png";
const NAVBAR_REFS = {
    LIKED: "liked.html",
    BLOCKED: "blocked.html",
    SEARCH: "search.html",
    DRAW: 'draw.html',
    ABOUT: 'about.html'
};
function isLoggedIn() {
    return getNetlifyIdentity() && getNetlifyIdentity().currentUser();
}

function getNavBarHtml(likedRef, blockedRef, searchRef, drawRef, aboutRef) {
    function getNavClass() {
        let results = [];
        for (let i in arguments) {
            results[i] = arguments[i] === "#" ? " blue darken-1" : "";
        }
        return results;
    }

    function getAccountDropdown() {
        if (!isLoggedIn()) {
            return ['', `<li><a href="#!" onclick="getAccount(true)" > Login <span class="hide-on-med-and-down">/ Sign up</span> <i class="material-icons right">lock</i></a></li>`, ``];
        } else {
            let dropdown = `<li><a class="dropdown-trigger" href="#!"  data-target="account_dropdown_list"><i
        class="material-icons right">arrow_drop_down</i></a>
</li>`;
            let list = `<ul id="account_dropdown_list" class="dropdown-content">
    <li><a href="#!" class="black-text center" onclick="logout();" >Logout</a></li>
</ul>   `;
            let sidenav = `<li><a href="#!" onclick="logout();" class="center" >Logout</a></li>`;
            return [list, dropdown, sidenav];
        }
    }

    let [likedClass, blockedClass, searchClass, drawClass, aboutClass] = getNavClass(likedRef, blockedRef, searchRef, drawRef, aboutRef);
    let loggedInVeil = isLoggedIn() ? `` : `style = "display: none;"`;
    let [accountDropdownList, accountDropdown, logInOutSideNav] = getAccountDropdown();
    return `
<nav id="navbar">
    <div class="nav-wrapper blue-grey darken-2">
        <a href="${drawRef}" class="brand-logo center">Tap&Resolve</a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"><i class="material-icons">menu</i></a>
        <ul class="right ">
            <li ${loggedInVeil} class="${likedClass} hide-on-med-and-down"><a href="${likedRef}"><i
                    class="material-icons green-text ${likedClass}">check</i></a></li>
            <li ${loggedInVeil} class="${blockedClass} hide-on-med-and-down"><a href="${blockedRef}"><i
                    class="material-icons red-text ${blockedClass}">block</i></a></li>
            <li class="${searchClass} hide-on-med-and-down"><a href="${searchRef}"><i
                    class="material-icons prefix ${searchClass}">search</i></a></li>
            <li class="${aboutClass} hide-on-med-and-down"><a href="${aboutRef}"><i
                    class="material-icons prefix ${aboutClass}">help</i></a></li>
            ${accountDropdown}
        </ul>

    </div>
</nav>
        ${accountDropdownList}

<ul class="sidenav" id="mobile-demo">
    <li ${loggedInVeil} class="${likedClass}"><a href="${likedRef}"><i style="width:100%;"
                                                                 class="center-align material-icons green-text">check</i></a>
    </li>
    <li ${loggedInVeil} class="${blockedClass}"><a href="${blockedRef}"><i style="width:100%;"
                                                                 class="center-align material-icons red-text">block</i></a>
    </li>
    <li class="${searchClass}"><a href="${searchRef}"><i style="width: 100%"
                                                                 class="center-align material-icons prefix">search</i></a>
    </li>
    <li class="${aboutClass}"><a href="${aboutRef}"><i style="width: 100%"
                                                                 class="center-align material-icons prefix">help</i></a>
    </li>
    ${logInOutSideNav}
</ul>`
}


function addNavBarAndLogin(likedRef, blockedRef, searchRef, drawRef, aboutRef) {
    $("body").prepend($(getNavBarHtml(likedRef, blockedRef, searchRef, drawRef, aboutRef)));
    $(".dropdown-trigger").dropdown();
    $('.sidenav').sidenav();
    $('.modal').modal({
        onCloseEnd: handleModalClose
    });
}

function resetNavBarAndLogin(likedRef, blockedRef, searchRef, drawRef, aboutRef) {
    $("#navbar").remove();
    addNavBarAndLogin(likedRef, blockedRef, searchRef, drawRef, aboutRef);
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

