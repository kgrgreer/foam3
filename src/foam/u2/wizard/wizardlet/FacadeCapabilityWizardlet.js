/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'FacadeCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  requires: [
    'foam.u2.wizard.wao.SplitWAO',
    'foam.u2.wizard.data.FacadeWizardletSaver',
    'foam.u2.wizard.data.ProxyLoader',
  ],

  properties: [
    {
      class: 'FObjectArray',
      name: 'facadeWizardletSpecs',
      of: 'foam.u2.wizard.wizardlet.FacadeWizardletSpec',
      factory: function(){
        return [];
      }
    },
    {
      name: 'wao',
      factory: function () {
        var splitWAO = this.SplitWAO.create(
          {
            loader: {
              class: 'foam.u2.wizard.data.CreateLoader'
            },
            saver: {
              class: 'foam.u2.wizard.data.FacadeWizardletSaver'
            }
          },
          this.__context__
        );

        return splitWAO;
      }
    }
  ]
});
