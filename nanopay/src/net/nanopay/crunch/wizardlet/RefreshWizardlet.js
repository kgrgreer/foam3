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

  methods: [
    {
      flags: ['web'],
      name: 'save',
      code: async function() {
        var ucj = await this.SUPER();
        if ( ucj.status === foam.nanos.crunch.CapabilityJunctionStatus.GRANTED )
          this.window.location.reload();
        return;
      }
    }
  ]
});
