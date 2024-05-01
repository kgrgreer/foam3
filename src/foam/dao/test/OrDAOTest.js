/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.test',
  name: 'OrDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'foam.dao.OrDAO',
    'foam.dao.MDAO',
    'foam.mlang.sink.Count',
  ],

  methods: [
    {
    name: 'runTest',
    javaCode: `
    DAO dao1 = new MDAO(Currency.getOwnClassInfo());
    DAO dao2 = new MDAO(Currency.getOwnClassInfo());

    DAO or = new OrDAO(dao1, dao2);
    Currency cur = new Currency(x);
    cur.setId("CA1");
    dao1.put(cur);
    cur = new Currency(x);
    cur.setId("CA2");
    dao1.put(cur);
    cur = new Currency(x);
    cur.setId("US1");
    dao2.put(cur);
    cur = new Currency(x);
    cur.setId("US2");
    dao2.put(cur);

    // test readonly.
    try {
      or.put(cur);
      test(false, "or put should throw exception");
    } catch (UnsupportedOperationException e) {
      test(true, "or put threw UnsupportedOperationException");
    }

    // test count
    Count count = (Count) or.select(new Count());
    test ( count.getValue() == 4, "or count expected 4 "+count.getValue());
    `
    }
  ]
})
