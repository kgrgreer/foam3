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

  requires: ['foam.core.Latch'],

  properties: [
    {
      name: 'subObj'
    },
    {
      name: 'isGranted',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      class: 'Boolean',
      name: 'supportsNotifications',
      factory: function() {
        if ( globalThis.isIOSApp ) {
          // Any ios client using WKWebView as a wrapper for a foam app needs to use this handler to return
          // the endpoint to push to.
          return this.window.webkit.messageHandlers['push-token'];
        }
        return 'Notification' in this.window;
      }
    },
  ],

  methods: [
    function init() {
      this.safeRegisterSub();
      // This isnt actually needed since on client reload ^ will be called anyway
      // this.__subContext__.loginSuccess$.sub(() => { this.register(); })
      this.window.addEventListener('push-permission-token', event => {
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

      this.isGranted.resolve(true);
      this.pushRegistry.subscribe(null, endpoint, key, auth, token);
    },
    function subWhenReady() {
      let self = this;
      function subWhenReady_(reg) {
        console.debug('Service worker registration ready:', reg);
        reg.pushManager.subscribe({
          // exported by RegisterServiecWorker
          applicationServerKey: globalThis.pushPublicKey,
          userVisibleOnly: true
        }).then(sub => {
          if ( sub ) {
            console.debug('Push Manager subscription succeeded:', sub);
            self.subObj = JSON.parse(JSON.stringify(sub));
            self.register();
          } else {
            console.warn('Push Manager no permission to receive notifications:', sub);
          }
        },
        error => {
          console.warn('Service worker push subscription failed:', error);
        });
      }
    
      return globalThis.swPromise.then(
        reg => subWhenReady_(reg),
        err => console.warn('Error waiting for service worker to become ready:', err)
      );
    },
    function shouldRequestWebNotificationPermission() {
      return 'Notification' in window && Notification.permission !== 'granted';
    },
    async function requestNotificationPermission() {
      // Reset latch when asking for permission
      this.isGranted = this.Latch.create();
      if ( globalThis.isIOSApp ) {
        // Ask ios app to ask for permission
        // Returned by the app listener event;
        return this.window.webkit.messageHandlers['push-permission-request'].postMessage('');
      }
      if ( ! this.shouldRequestWebNotificationPermission() )
        return this.isGranted.resolve(true);
      let ret = await Notification.requestPermission();
      if ( ret == 'granted' ) {
        return this.subWhenReady();
      }
      this.isGranted.resolve(false);
    },
    async function safeRegisterSub() {
      // Only registers subscription if notification has been already granted
      // Call on init to ensure fetching updated token
      if ( globalThis.isIOSApp ) {
        try {
          let state = await this.window.webkit.messageHandlers['push-permission-state'].postMessage('');
          if ( this.MapIOSState(state) == 'granted' ) {
            return this.window.webkit.messageHandlers['push-token'].postMessage('');
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        if ( 'Notification' in window && Notification.permission === 'granted' ) {
          await this.subWhenReady();
          return;
        }
      }
      return this.isGranted.resolve(false);
    },
    function MapIOSState(state) {
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
