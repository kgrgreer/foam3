/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'RerenderWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  documentation: `
    Invokes a re-render on specified wizardlets after saving this wizardlet.
  `,

  imports: [
    'window',
    'wizardlets'
  ],

  properties: [
    {
      name: 'rerenderList',
      class: 'StringArray'
    }
  ],

  methods: [
    {
      flags: ['web'],
      name: 'save',
      code: async function(...args) {
        var ucj = await this.SUPER(...args);
        for ( let id of this.rerenderList ) {
          let w = this.getWizardletById(id);
          if ( ! w ) continue;
          if ( w.isAvailable ) {
            w.isAvailable = false;
            setTimeout(() => { w.isAvailable = true; }, 20);
          }
        }
        return ucj;
      }
    },
    function getWizardletById(id) {
      for ( let w of this.wizardlets ) {
        if ( w.id == id ) return w;
      }
    }
  ]
});
