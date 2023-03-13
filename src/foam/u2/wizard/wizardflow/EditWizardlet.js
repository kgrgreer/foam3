/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'EditWizardlet',
  extends: 'foam.u2.wizard.wizardflow.SubDSL',

  requires: [
    'foam.u2.wizard.agents.QuickAgent',
    'foam.u2.wizard.axiom.AlternateFlowAction'
  ],

  properties: [
    {
      class: 'String',
      name: 'wizardletId'
    }
  ],

  methods: [
    function spec (spec) {
      this.sequence.tag(this.QuickAgent, {
        executeFn: x => {
          const wizardlet = this.getWizardlet_(x);
          for ( const k in spec ) {
            wizardlet[k] = spec[k];
          }
        }
      });
      return this;
    },
    function addAlternateFlowAction (name, args) {
      this.sequence.tag(this.QuickAgent, {
        executeFn: x => {
          const w = this.getWizardlet_(x);
          w.dynamicActions.push(this.AlternateFlowAction.create({
            ...args,
            alternateFlow: x[name]
          }, x))
        }
      })
      return this;
    },

    function getWizardlet_(x) {
      return x.wizardlets.find(w => w.id === this.wizardletId);
    }
  ]
})
