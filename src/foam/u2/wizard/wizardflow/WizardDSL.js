/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'WizardDSL',
  documentation: `
    Convenience methods for the WizardFlow Fluent, included as a mixin.
  `,

  requires: [
    'foam.u2.wizard.agents.QuickAgent',
    'foam.u2.wizard.wizardflow.Export'
  ],

  methods: [
    function value (name, value) {
      return this.tag(this.Export, { name, value });
    }
  ]
});
