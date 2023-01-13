/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.analytics',
  name: 'AlternateFlowRefinement',
  refines: 'foam.u2.wizard.AlternateFlow',

  imports: [
    'analyticsAgent?'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enableAnalytics'
    },
    {
      class: 'String',
      name: 'analyticsName'
    }
  ],

  methods: [
    {
      name: 'refinedMethod_execute_AlternateFlowRefinement',
      code: foam.u2.wizard.AlternateFlow.getAxiomByName('execute').code
    },
    function execute (x) {
      if ( this.enableAnalytics && this.analyticsAgent ) {
        const analyticsEvent = {
          name: `AlternateFlow_${this.analyticsName}`,
          tags: ['wizard']
        };
        this.analyticsAgent.pub('event', analyticsEvent);
      } else {
        console.warn(
          'analytics is on for this AlternateFlow, but analytics is disabled',
          this
        );
      }

      const result = this.refinedMethod_execute_AlternateFlowRefinement(x);
      return result;
    }
  ]
});
