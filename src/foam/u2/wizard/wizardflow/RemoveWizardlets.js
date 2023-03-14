/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'RemoveWizardlets',
  implements: ['foam.core.ContextAgent'],

  properties: [
    {
      class: 'String',
      name: 'wizardletIds'
    }
  ],

  methods: [
    async function execute(x) {
      x = x || this.__context__;
      for ( const wizardletId of this.wizardletIds ) {
        const i = x.wizardlets.findIndex(w => w.id === wizardletId);
        if ( i == -1 ) continue;
        x.wizardlets.splice(i, 1);
      }
    }
  ]
})
