/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PredicatedPutDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Filter put operations`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Loggers'
  ],

  javaCode: `
  public PredicatedPutDAO(X x, Predicate predicate, DAO delegate) {
    super(x);
    setPredicate(predicate);
    setDelegate(delegate);
  }
  `,

  properties: [
    {
      name: 'predicate',
      class: 'foam.mlang.predicate.PredicateProperty',
      javaFactory: 'return MLang.TRUE;'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( getPredicate().f(obj) ) {
        return getDelegate().put_(x, obj);
      }
      return obj;
      `
    }
  ]
});
