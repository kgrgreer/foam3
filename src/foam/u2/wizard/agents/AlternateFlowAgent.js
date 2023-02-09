/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AlternateFlowAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  imports: [
    'wizardController?'
  ],

  requires: [
    'foam.u2.wizard.WizardPosition'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'alternateFlow'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'contextPredicate',
      documentation: `
        If a contextPredicate is given, the alternate flow will only be executed
        if this returns true.
      `
    }
  ],

  methods: [
    async function execute() {
      if ( this.contextPredicate ) {
        const check = this.contextPredicate.f(this.__context__);
        if ( ! check ) return;
      }
        
      this.alternateFlow.execute(this.__context__);

      if ( this.alternateFlow.wizardletId ) {
        if ( this.wizardController ) {
          this.alternateFlow.handleNext(this.wizardController);
          return;
        }

        const wizardletId = this.alternateFlow.wizardletId;
        const x = this.__context__;
        const wi = x.wizardlets.findIndex(w => w.id == wizardletId);
        if ( wi < 0 ) {
          throw new Error('wizardlet not found with id: ' + wizardletId);
        }
        const pos = this.WizardPosition.create({
          wizardletIndex: wi,
          sectionIndex: 0
        })
        x.initialPosition = pos;
      }
    }
  ]
});
