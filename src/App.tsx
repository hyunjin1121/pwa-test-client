import React, { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker Registered');
      });
    }
  }, []);

  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BLMuqANzgt98IBfsEIeO1a7ZMhtKV73qqxWvn44oRhxamelcLU3jzEPXrXR9S_qy8JwfzeJzKhgCX8cvHNB7QG4', // VAPID 공개 키
    });

    console.log('Subscription:', subscription);

    await fetch('https://a2b5780289322ce17a2fac7c4bf9e221.serveo.net/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
  };

  return (
    <div>
      <h1>Web Push Notifications</h1>
      <button onClick={subscribeToPush}>Subscribe to Push</button>
    </div>
  );
};

export default App;