/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistryAgent',

  documentation: 'Client-side NSpec which calls PushRegistry with subscription information.',

  imports: [ 'pushRegistry', 'window' ],

  properties: [
    {
      name: 'subObj'
    }
  ],

  methods: [
    function init() {
      this.safeRegisterSub();
      // This isnt actually needed since on client reload ^ will be called anyway
      // this.__subContext__.loginSuccess$.sub(() => { this.register(); })
      this.window.addEventListener('push-permission-token', event => {
        console.log(event.detail);
        this.subObj = { token: event.detail.token };
        this.register();
      });
    },
    function register(sub) {
      sub = this.subObj;
      if ( ! sub ) return;

      if ( sub.endpoint ) {
        var endpoint = sub.endpoint;
        var key      = sub.keys.p256dh;
        var auth     = sub.keys.auth;
      } else if ( sub.token ) {
        var token = sub.token;
      } else {
        console.warn('Invalid push registry');
      }

      console.log('PushRegistryAgent executed.');
      this.pushRegistry.subscribe(null, endpoint, key, auth, token);
    },
    function subWhenReady() {
      let self = this;
      function subWhenReady_(reg) {
        console.log('Service worker registration ready:', reg);
        reg.pushManager.subscribe({
          // exported by RegisterServiecWorker
          applicationServerKey: globalThis.pushPublicKey,
          userVisibleOnly: true
        }).then(sub => {
          if ( sub ) {
            console.log('Push Manager subscription succeeded:', sub);
            self.subObj = JSON.parse(JSON.stringify(sub));
            self.register();
          } else {
            console.log('Push Manager no permission to receive notifications:', sub);
          }
        },
        error => {
          console.log('Service worker push subscription failed:', error);
        });
      }
    
      return globalThis.swPromise.then(
        reg => subWhenReady_(reg),
        err => console.log('Error waiting for service worker to become ready:', err)
      );
    },
    function shouldRequestWebNotificationPermission() {
      return 'Notification' in window && Notification.permission !== 'granted';
    },
    async function requestNotificationPermission() {
      if ( globalThis.isIOSApp ) {
        // Ask ios app to ask for permission
        // Returned by the app listener event;
        return this.window.webkit.messageHandlers['push-permission-request'].postMessage('');
      }
      if ( ! this.shouldRequestWebNotificationPermission() ) return;
      let ret = await Notification.requestPermission();
      if ( ret.status == 'granted' ) {
        return subWhenReady();
      }
    },
    async function safeRegisterSub() {
      // Only registers subscription if notification has been already granted
      // Call on init to ensure fetching updated token
      if ( globalThis.isIOSApp ) {
        try {
          let state = await this.window.webkit.messageHandlers['push-permission-state'].postMessage('');
          if ( this.MapiOSState(state) == 'granted' ) {
            this.window.webkit.messageHandlers['push-token'].postMessage('');
          }
        } catch (e) { 
          console.error(e); 
        }
      } else {
        if ( 'Notification' in window && Notification.permission === 'granted' ) {
          await this.subWhenReady();
        }
      }
    },
    function MapiOSState(state) {
      // Maps ios notification states to equivalent webPush states
      switch ( state ) {
        case 'notDetermined':
          return 'default';
        case 'denied':
          return 'denied';
        case 'authorized':
        case 'ephemeral':
        case 'provisional':
          return 'granted';
        case 'unknown':
        default:
          break;
      }
    }
  ]
});
