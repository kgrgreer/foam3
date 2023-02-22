/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'PublishToWizardletsAgent',

  imports: [
    'wizardlets'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  properties: [
    {
      class: 'String',
      name: 'event'
    }
  ],

  methods: [
    async function execute() {
      for ( const wizardlet of this.wizardlets ) {
        wizardlet[this.event]?.();
      }
    }
  ]
});
