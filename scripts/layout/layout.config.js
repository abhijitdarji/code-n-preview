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

    //SNIPPETS MEGA MENU
    var $menu = $(".dropdown-menu.mega");

    // Hook up events to be fired on menu row activation.
    $menu.menuAim({
        activate: activateSubmenu,
        deactivate: deactivateSubmenu
    });

    function activateSubmenu(row) {
        var $row = $(row),
            submenuId = $row.data("submenuId"),
            $submenu = $("#" + submenuId),
            height = $menu.outerHeight(),
            width = $menu.outerWidth();
        //,
        //subheight = $submenu.outerHeight(),
        //subwidth = $submenu.outerWidth();

        // Show the submenu
        $submenu.css({
            display: "block",
            top: -1,
            left: width - 1,  // main should overlay submenu
            maxWidth: 600,
            width: 600,
            //height: subheight  // padding for main dropdown's arrow
        });

        // Keep the currently activated row's highlighted look
        $row.find("a").addClass("maintainHover");
    }

    function deactivateSubmenu(row) {
        var $row = $(row),
            submenuId = $row.data("submenuId"),
            $submenu = $("#" + submenuId);

        // Hide the submenu and remove the row's highlighted look
        $submenu.css("display", "none");
        $row.find("a").removeClass("maintainHover");
    }

    // Bootstrap's dropdown menus immediately close on document click.
    // Don't let this event close the menu if a submenu is being clicked.
    // This event propagation control doesn't belong in the menu-aim plugin
    // itself because the plugin is agnostic to bootstrap.
    $(".dropdown-menu.mega li").click(function (e) {
        e.stopPropagation();
    });

    $(document).click(function () {
        // Simply hide the submenu on any click. Again, this is just a hacked
        // together menu/submenu structure to show the use of jQuery-menu-aim.
        $(".popover").css("display", "none");
        $("a.maintainHover").removeClass("maintainHover");
    });

});