/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',

  flags: [],

  documentation: 'A convenience object which provides access to all mlangs.',
  // TODO: why is this needed? Why not just make Expressions a Singleton?

  axioms: [
    foam.pattern.Singleton.create()
  ]
});
