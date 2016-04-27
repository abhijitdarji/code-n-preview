var myLayout;

$(document).ready(function () {

    myLayout = $('#CodeContainer').layout({
        enableCursorHotkey: false,
        west__minSize: 50,
        center__childOptions: {
            enableCursorHotkey: false,
            west__size: "50%",
            center__size: "50%",
            center__maskContents: true
        }

    });

});

function setWidth(size) {
    $('#preview').toggleClass(size);
}