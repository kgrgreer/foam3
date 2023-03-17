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
    async function save() {
      const returnValue = this.delegate.save.call(this, arguments);

      const ucj = await this.crunchService.getJunction(this.__subContext__, this.capability);
      if ( ucj.status !== this.CapabilityJunctionStatus.AVAILABLE ) {
        await this.thenFlow.execute(this.__subContext__);
      } else {
        await this.elseFlow.execute(this.__subContext__);
      }
      return returnValue;
    }
  ]
});
