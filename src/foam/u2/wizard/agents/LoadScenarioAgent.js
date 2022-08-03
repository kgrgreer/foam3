/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'LoadScenarioAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Loads a wizard scenario - a wizard defined by "fake" capabilities
    (frontend-only capabilities for defining transient wizards). This
    avoids excess CRUNCH backend calls and allows frontend updates
    without journal updates.
  `,

  requires: [
    'foam.classloader.OrDAO',
    'foam.dao.ArrayDAO'
  ],

  properties: [
    {
      class: 'Class',
      name: 'scenario'
    }
  ],

  methods: [
    async function execute () {
      let x = this.__subContext__;

      const scenario = this.scenario.create({}, x);

      x = x.createSubContext({
        capabilityDAO: this.OrDAO.create({
          primary: this.ArrayDAO.create({
            of: 'foam.nanos.crunch.Capability',
            array: scenario.capabilities
          }),
          delegate: x.capabilityDAO
        }),
        prerequisiteCapabilityJunctionDAO: this.OrDAO.create({
          primary: this.ArrayDAO.create({
            of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
            array: scenario.capabilityCapabilityJunctions
          }),
          delegate: x.prerequisiteCapabilityJunctionDAO
        })
      });

      return x;
    }
  ]
});
