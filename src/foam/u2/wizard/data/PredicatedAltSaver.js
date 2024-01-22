/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PredicatedAltSaver',
  extends: 'foam.u2.wizard.data.AlternateFlowSaver',

  documentation: `
    Used to execute an alternateflow upon saving a wizardlet.
    When using should set wizardlet.goNextOnSave to false

    Note: when capability id set, predicate is ignored
  `,

  imports: [
    'crunchService',
    'wizardController'
  ],

  requires: [
    'foam.u2.wizard.axiom.AlternateFlowAction',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      class: 'String',
      name: 'capability'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'thenFlow'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'elseFlow'
    }
  ],

  methods: [
    async function save(...a) {
      const returnValue = this.delegate.save(...a);
      let res;
      if ( this.capability ) {
        const ucj = await this.crunchService.getJunction(this.__subContext__, this.capability);
        res = ucj.status !== this.CapabilityJunctionStatus.AVAILABLE;
      } else {
        res = this.predicate.f(a[0]);
      }
      
      if ( res ) {
        await this.thenFlow.execute(this.__subContext__);
      } else {
        await this.elseFlow.execute(this.__subContext__);
      }
      return returnValue;
    }
  ]
});
