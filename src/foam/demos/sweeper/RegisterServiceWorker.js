if ( 'serviceWorker' in navigator ) {
  console.log('Registering ServiceWorker');
  navigator.serviceWorker.register("/foam3/src/foam/demos/sweeper/ServiceWorker.js");
}
