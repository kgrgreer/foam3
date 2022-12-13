/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'HideIfValidSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  imports: [
    'wizardlets'
  ],

  properties: [
    {
      class: 'String',
      name: 'dataWizardlet'
    },
    {
      class: 'String',
      name: 'hideWizardlet'
    },
    {
      class: 'Boolean',
      name: 'disable'
    }
  ],

  methods: [
    async function save (...a) {
      const result = await this.delegate.save(...a);
      const hideWizardlet = this.wizardlets.find(w => w.id == this.hideWizardlet);
      const dataWizardlet = this.wizardlets.find(w => w.id == this.dataWizardlet);
      if ( dataWizardlet.isValid ) {
        if ( this.disable ) hideWizardlet.isAvailable = false;
        else hideWizardlet.isVisible = false;
      }
      return result;
    }
  ]
});
