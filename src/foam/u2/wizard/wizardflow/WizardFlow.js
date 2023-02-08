/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'WizardFlow',
  extends: 'foam.util.async.SequenceInstaller',
  mixins: [
    'foam.u2.wizard.wizardflow.WizardDSL'
  ],
  requires: [
    'foam.u2.crunch.EasyCrunchWizard',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.WizardType',
    'foam.u2.wizard.wizardflow.AddCapabilityHierarchy',
    'foam.u2.wizard.wizardflow.Export',
    'foam.u2.wizard.wizardflow.EditWizardlet',
    'foam.u2.wizard.wizardflow.Predicated',
    'foam.util.async.AdvanceToAgent'
  ],
  properties: [
    ['initialized_', false]
  ],
  methods: [
    async function install (...a) {
      const SUPER = this.SUPER.bind(this);
      if ( ! this.initialized_ ) {
        if ( typeof this.sequence !== 'function' ) {
          throw new Error('abstract method WizardFlow.sequence() is required');
        }
        await this.sequence();
        this.initialized_ = true;
      }
      return await SUPER(...a);
    },
  ]
});
