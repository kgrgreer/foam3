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
    'sessionID'
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
    }
  ],
  methods: [
    async function execute() {
      var self = this;
      var trace = this.traceIDKey$get(this.__subContext__);
      var obj = this.objectIDKey$get(this.__subContext__);
      this.analyticsAgent.sub('event', function(_, __, ___, evt) {
        // TODO: add subclass support
        let analyticEvent = self.AnalyticEvent.create({...evt, traceId: trace, objectId: obj, sessionId: self.sessionID, timestamp: new Date()})
        self.analyticEventDAO.put(analyticEvent).then( v => console.log(v));
      });
    }
  ]
});
