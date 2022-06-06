/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'FoobarCapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  properties: [
    {
      class: 'Map',
      name: 'args',
      documentation: `
        Initial values for a capability's data, corresponding to the
        model specified by 'of'.
      `
    }
  ]
});