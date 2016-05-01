var myLayoutOuter;
var myLayoutInner;

$(document).ready(function () {

    myLayoutOuter = $('#CodeContainer').layout({
        enableCursorHotkey: false,
        west__minSize: 50,
        west: {
            onopen_start: function () {
                if ($('.CodeMirror').hasClass('CodeMirror-fullscreen')) {
                    $('.CodeMirror').removeClass('CodeMirror-fullscreen');
                }
            }
        }
    });

    myLayoutInner = $('.ui-layout-center').layout({
        enableCursorHotkey: false,
        west__size: "50%",
        center__size: "50%",
        center__maskContents: true
    })

    window.myLayoutOuter = myLayoutOuter;
    window.myLayoutInner = myLayoutInner;

    $('body').tooltip({
        selector: '[data-toggle="tooltip"]'
    });

    keyboardJS.bind('ctrl + alt + n', function (e) {
        $('#aNewFile').click();
        $('[autofocus]:first').focus();
    });

});