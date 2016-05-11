$(document).ready(function () {

    if ('serviceWorker' in navigator) {
        var scope = 'run/';
        navigator.serviceWorker.register('/run/sw.js', { scope: scope })
            .then(function (r) {
                console.log('sw.js registered');
            })
            .catch(function (whut) {
                console.error('error registering sw.js ');
                console.error(whut);
            });
    }

});