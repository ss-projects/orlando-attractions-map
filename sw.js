const CACHE_NAME = 'neighborhood-map-react.v1';
// during testing chrome-extension url was causing the error, so ignoring that one right now.
// more can be added if there exists a similar issue.
const urlsToIgnore = [
    'chrome-extension:'
];

self.addEventListener('install', function (event) {
    try {
        const urlsToCache = [
            '/',
            '/index.html'
        ];

        event.waitUntil(
            caches.open(CACHE_NAME).then(function (cache) {
                // cache the responses.
                return cache.addAll(urlsToCache);
            })
        );
    }
    catch(ex) {
        console.log(ex);
    }
});

self.addEventListener('fetch', function (event) {
    try {
        // only calling respondWith on GET and requests which are not ignored.
        if (event.request.method === 'GET' && ignoreRequest(event.request) === false) {
            event.respondWith(
                // fetch response and cache the updated response.
                fetch(event.request).then(function (response) {
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, response);
                    });
                    return response.clone();
                }).catch(function () {
                    // return cached response in case there is no internet.
                    // ignore query string during match -> ignoreSearch: true
                    return caches.match(event.request, {
                        ignoreSearch: true
                    });
                })
            );
        }
    }
    catch(ex) {
        console.log(`Unable to add ${event.request.url} to cache: ${ex}`);
    }
});

// during testing chrome-extension url was causing the error, so ignoring that one right now.
// more can be added if there exists a similar issue.
const ignoreRequest = (request) => {
    let ignore = false;
    const url = request.url;
    urlsToIgnore.forEach(urlItem => {
        if (ignore === false) {
            ignore = (url.indexOf(urlItem) !== -1);
        }
    });

    if (ignore === true) {
        console.log(`Following url is ignored and not added to cache: ${url}`);
    }
    return ignore;
}