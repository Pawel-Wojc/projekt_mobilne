// read config
//const CONFIG = require('./config.json');

const getPermisionAndRegisterUser = () => {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager
                    .getSubscription()

                    .then((subscription) => {
                        if (!subscription) {
                            registration.pushManager
                                .subscribe({
                                    userVisibleOnly: true,
                                    applicationServerKey: urlB64ToUint8Array(
                                        'BFISZ7kmZ3UsRZvax9oZWsvr48z-HOWz-pclsZnl_WYAhuL8eDLu7aoMzfdvLEs3-UdI2dIFPYC8oWoLpzDTXm4'
                                    ),
                                })
                                .then((subscription) => {
                                    sendToAPI(subscription);
                                })
                                .catch((err) =>
                                    console.error('Subscription failed:', err)
                                );
                        } else {
                            console.log(
                                'User already subscribed:',
                                subscription
                            );
                        }
                    });
            });
        }
    });
};

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

const arrayBufferToBase64 = (buffer) =>
    btoa(
        Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(
            ''
        )
    );

const sendToAPI = async (subscription) => {
    console.log('auth ' + arrayBufferToBase64(subscription.getKey('auth')));
    console.log('p256dh ' + subscription.getKey('p256dh'));
    try {
        const response = await fetch(
            'http://localhost:3000/api/save-push-sub',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    userId: localStorage.getItem('userId'),
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: arrayBufferToBase64(subscription.getKey('auth')),
                        p256dh: arrayBufferToBase64(
                            subscription.getKey('p256dh')
                        ),
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        } else {
            console.log(response);
        }
    } catch (error) {
        console.error('Błąd przesyłania subskrypcji:', error);
    }
};
