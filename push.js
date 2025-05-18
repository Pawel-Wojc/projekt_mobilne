// read config
const CONFIG = require('./config.json');

const getPermisionAndRegisterUser = () => { 
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {

                registration.pushManager.getSubscription()
                
                .then(subscription => {
                    if (!subscription) {
                    
                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlB64ToUint8Array(CONFIG.VAPID_public_key)
                        })
                        .then(subscription => {
                            console.log('User subscribed:', subscription);
                        })
                        .catch(err => console.error('Subscription failed:', err));

                    } else {
                        console.log('User already subscribed:', subscription);
                    }
                });
            });
        } 
    });
}