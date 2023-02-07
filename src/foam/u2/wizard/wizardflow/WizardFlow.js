/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'WizardFlow',
  extends: 'foam.util.async.SequenceInstaller',
  requires: [
    'foam.u2.crunch.EasyCrunchWizard',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.WizardType',
    'foam.u2.wizard.wizardflow.AddCapabilityHierarchy',
    'foam.util.async.AdvanceToAgent'
  ],
  methods: [
    function init () {
      if ( typeof this.sequence !== 'function' ) {
        throw new Error('abstract method WizardFlow.sequence() is required');
      }
      this.sequence();
    },
    async function execute (x) {
      x = x || this.__context__;
      x = x.createSubContext({
        wizardlets: [],
        initialPosition: this.WizardPosition.create({
          wizardletIndex: 0,
          sectionIndex: 0
        })
      });
      return await this.SUPER(x);
    }
  ]
});
