/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'NullSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.Serializable'],

  documentation: 'Null Pattern (do-nothing) Sink.',

  axioms: [
    foam.pattern.Singleton.create()
  ]
});
