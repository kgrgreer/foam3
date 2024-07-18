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
    'window'
  ],

  exports: [
    'analyticsAgent',
    'logAnalyticsEvent',
    'wizardTraceID'
  ],

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
    },
    {
      class: 'Boolean',
      name: 'createTraceID',
      value: false
    },
    {
      class: 'String',
      name: 'wizardTraceID'
    }
  ],
  methods: [
    function execute() {
      var self = this;
      this.analyticsAgent.sub('event', function(_, __, ___, evt) {
        self.logAnalyticsEvent(evt);
      });

      if (this.createTraceID && !this.traceIdKey) {
        this.wizardTraceID = foam.uuid.randomGUID();
      }

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

          if ( a.length == 1 && a[0] === '' )
            a[0] = new Error("Empty console error log").stack;

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
    },

    async function logAnalyticsEvent(evt) {
      var traceId   = this.traceIDKey$get(this.__subContext__) || this.wizardTraceID;
      var objectId  = this.objectIDKey$get(this.__subContext__);

      // TODO: add subclass support
      var analyticEvent = this.AnalyticEvent.create({...evt, traceId, objectId});
      await this.analyticEventDAO.put(analyticEvent);
    }
  ]
});
