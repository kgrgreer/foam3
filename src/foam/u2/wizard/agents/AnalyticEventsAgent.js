/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AnalyticEventsAgent',
  implements: [ 'foam.core.ContextAgent' ],

  requires: ['foam.nanos.analytics.AnalyticEvent'],

  imports: [
    'analyticEventDAO',
    'sessionID',
    'window'
  ],

  exports: ['analyticsAgent'],

  topics: ['analyticsAgent'],

  properties: [
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'traceIDKey',
      documentation: 'Context key for preferred traceID of AnalyticEvent'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'objectIDKey',
      documentation: 'Context key for preferred objectID of AnalyticEvent'
    },
    {
      class: 'Boolean',
      name: 'logDeviceInfo',
      value: true
    }
  ],
  methods: [
    async function execute() {
      var self = this;
      var trace = this.traceIDKey$get(this.__subContext__);
      var obj = this.objectIDKey$get(this.__subContext__);
      this.analyticsAgent.sub('event', function(_, __, ___, evt) {
        // TODO: add subclass support
        let analyticEvent = self.AnalyticEvent.create({...evt, traceId: trace, objectId: obj, sessionId: self.sessionID})
        self.analyticEventDAO.put(analyticEvent);
      });

      // TODO: Temp fix for 3.20 iframe logging
      window.analyticsAgent = this.analyticsAgent;

      for ( const method of ['error' /*, 'warn' */] ) { // disabling logging console.warns for now
        const delegate = console[method].bind(console);
        console[method] = (...a) => {
          delegate(...a);
          if ( a[0] && typeof a[0] === 'string' && a[0].startsWith('Expression returned undefined') ) {
            // This warnings happen too frequently to be useful
            return;
          }
          this.analyticsAgent.pub('event', {
            name: 'CONSOLE_' + method.toUpperCase(),
            extra: foam.json.stringify(a)
          });
        };
      }
      // Log device info
      if ( this.logDeviceInfo ) {
        this.analyticsAgent.pub('event', {
          name: 'USER_AGENT',
          extra: this.window.navigator.userAgent
        });

        this.analyticsAgent.pub('event', {
          name: 'SCREEN_RESOLUTION',
          extra: `${this.window.screen.width}x${this.window.screen.height}`
        });

        this.analyticsAgent.pub('event', {
          name: 'WINDOW_RESOLUTION',
          extra: `${this.window.innerWidth}x${this.window.innerHeight}`
        });
      }
    }
  ]
});
