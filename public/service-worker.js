self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            return cache.addAll([
                './',
            ]).catch(function(error) {
                    console.error('Error :', error);
                });
        })
    );
  console.log("Service Worker installed.");
});

self.addEventListener("activate", event => {
  console.log("Service Worker activated.");
});


self.addEventListener('push', function(event) {
    const data = event.data.json();  // Assuming the server sends JSON
    const options = {
        body: data.body,
    //    icon: 'icon.png',
    //    badge: 'badge.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/*
Do dodania na stronie po zalogowaniu
<div id="soft-ask">
    Stay updated with the latest news directly on your device. Allow notifications?
    <button onclick="subscribeUser()">Yes</button>
    <button onclick="hideSoftAsk()">Not now</button>
</div>
*/