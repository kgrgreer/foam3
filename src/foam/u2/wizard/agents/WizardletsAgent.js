/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'WizardletsAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'wizardlets? as priorWizardlets',
  ],

  exports: [
    'laterWizardlets as wizardlets',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      name: 'wizardlets',
      documentation: `
        The specified wizardlets will be exported as 'wizardlets' in this
        agent's output context. If the input context already has 'wizardlets'
        this agent will overwrite wizardlets with matching IDs and append
        new wizardlets to the end.
      `
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      name: 'laterWizardlets',
      factory: function () {
        const output = this.priorWizardlets || [];
        for (let wizardlet of this.wizardlets) {
          // Case 1: Overwrite matching wizardlet and continue
          let match = output.findIndex(pw => pw.id == wizardlet.id);
          if (match != -1) {
            output[match] = wizardlet;
            continue;
          }

          // Case 2: Append new wizardlet
          output.push(wizardlet);
        }
        return output;
      }
    }
  ],

  methods: [
    async function execute() { }
  ]
});