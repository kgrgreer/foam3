/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AlternateFlowAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'alternateFlow'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.ContextPredicate',
      name: 'contextPredicates',
      documentation: `
        If a contextPredicate is given, the alternate flow will only be executed
        if this returns true.
      `
    }
  ],

  methods: [
    async function execute() {
      if ( this.contextPredicates ) {
        var check = true;
        for ( var p of this.contextPredicates ) {
          try  {
            check = await p.execute(this.__context__);
          } catch (e) {
            console.info('Predicate check failed.');
            return
          }
          if ( ! check ) return;
        }
      }
        
      this.alternateFlow.execute(this.__context__);
      if ( this.alternateFlow.wizardletId)
        this.alternateFlow.handleNext(this.__subContext__.wizardController);
    }
  ]
});
