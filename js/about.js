$(document).ready(() => {
    addNavBarAndLogin(NAVBAR_REFS.LIKED, NAVBAR_REFS.BLOCKED, NAVBAR_REFS.SEARCH, NAVBAR_REFS.DRAW, "#");
});

function handleModalClose() {
}

function goToDrawPage() {
    location.href = NAVBAR_REFS.DRAW;
}