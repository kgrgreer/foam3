/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.analytics',
  name: 'AnalyticsEventHandlerAgent',
  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'analyticsAgent?'
  ],
  exports: [
    'handleEvent'
  ],
  methods: [
    async function execute() {},
    function handleEvent (event) {
      if ( ! this.analyticsAgent ) return;
      if ( ! event.wizardlet.pubAnalyticEvt ) return;

      const analyticsEvent = event.toAnalyticsEvent();
      this.analyticsAgent.pub('event', analyticsEvent);
    }
  ]
});
