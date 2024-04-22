/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.analytics',
  name: 'WizardEventRefinement',
  refines: 'foam.u2.wizard.event.WizardEvent',

  constants: [
    {
      name: 'WIZARD_NAME_TO_ANALYTIC',
      documentation: 'Map WizardEvent names to analytic event names',
      value: {
        WIZARDLET_SAVE: 'COMPLETE',
        WIZARDLET_GO_NEXT: 'USER_CLICKED_NEXT_BUTTON'
      }
    }
  ],

  methods: [
    function toAnalyticsEvent() {
      const wizardlet = this.wizardlet;
      const eventName = this.WIZARD_NAME_TO_ANALYTIC[this.eventType.name];
      return {
        name: foam.String.constantize(
          wizardlet.title || wizardlet.id ||
            (wizardlet.of?.name ?? 'UNKNOWN')
        ) + '_' + eventName,
        tags: ['wizard'],
        extra: wizardlet.evtExtra && wizardlet.evtExtra$get(wizardlet)
      };
    }
  ]
});