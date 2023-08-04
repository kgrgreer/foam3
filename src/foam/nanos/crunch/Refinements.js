/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.naons.crunch',
  name: 'CapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.crunch.Renewable'
  ]
});
