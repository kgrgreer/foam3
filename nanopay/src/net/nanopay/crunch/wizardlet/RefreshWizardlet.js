/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'RefreshWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'mustBeValid',
      value: false
    }
  ],

  methods: [
    {
      name: 'save',
      code: async function() {
        this.crunchController.save(this);
        this.window.location.reload();
        return;
      }
    }
  ]
});