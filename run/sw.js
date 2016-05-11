//ORIGINAL - https://gist.github.com/inexorabletash/687e7c5914049536f5a3
var dbs = new Map();

self.addEventListener('fetch', function (event) {

    var url = new URL(event.request.url);

    if (/\/run\//.test(url.pathname)) {
        
        var parts = url.pathname.split('/');
        var database = 'cnpDB';
        var store = 'files';
        var key = parts[2];

        if (!dbs.has(database)) {
            dbs.set(database, new Promise((resolve, reject) => {
                var request = indexedDB.open(database);
                // Abort the open if it was not already populated.
                request.onupgradeneeded = () => request.transaction.abort();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            }));
        }

        event.respondWith(
            dbs.get(database).then((db) => new Promise((resolve, reject) => {
                var tx = db.transaction(store);
                var request = tx.objectStore(store).get(key);

                request.onerror = () => {
                    //go for the server
                    return fetch(event.request);
                };

                request.onsuccess = () => {
                    var result = request.result;
                    var type;
                    if (result !== undefined) {
                        switch (result.ext) {
                            case 'html':
                                type = 'text/html';
                                break;
                            case 'css':
                                type = 'text/css';
                                break;
                            case 'js':
                                type = 'text/javascipt';
                                break;
                            default:
                                type = 'text/plain';
                                break;
                        }

                        resolve(new Response(result.value, {
                            headers: { 'Content-Type': type }
                        }));
                    }
                    else {
                        //go for the server
                        return fetch(event.request);
                    }

                    //db.close();
                };
            })));
        
    }
    else {
       event.respondWith(
            fetch(event.request)
        );
    }



});
