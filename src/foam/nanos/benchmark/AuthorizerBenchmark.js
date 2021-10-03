/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.benchmark',
  name: 'AuthorizerBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  documentation: `
  General benchmark authorizer
  {@authorizer} wraps target DAO using authorizer provided
  {@recordAmount} defines amount of records to be created for benchmark (creates users in new MDAO)
  {@op} a (CRUD) operation to run benchmark on.
  Each CRUD operation has its own method specified for benchmarking, meaning each benchmark will relate to a single operation.
  If further setup or additional logic on each CRUD operation is required, extending this class and referencing the setup and CRUD method should suffice.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.MDAO',
    'foam.nanos.auth.AuthorizationDAO',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.User',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.bench.BenchmarkResult',
    'foam.test.TestUtils'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return new MDAO(User.getOwnClassInfo());'

    },
    {
      name: 'authorizer',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Authorizer',
      javaFactory: 'return new foam.nanos.auth.StandardAuthorizer("user");'
    },
    {
      name: 'recordAmount',
      class: 'Int',
      value: 100
    },
    {
      name: 'dop',
      class: 'Enum',
      of: 'foam.dao.DOP',
      value: 'FIND'
    }
  ],

  methods: [
    {
      name: 'setup',
      javaCode: `
      setX(TestUtils.createTestContext(x, "foam"));

      if ( getDop() != foam.dao.DOP.PUT ) {
        for (int i = 1; i < getRecordAmount() + 1; i++) {
          User user = TestUtils.createTestUser();
          user.setId(i);
          user.setEmail(i + user.getEmail());
          getDao().put(user);
        }
      }

      if ( getAuthorizer() != null ) {
        setDao(new AuthorizationDAO.Builder(getX())
            .setDelegate(getDao())
            .setAuthorizer(getAuthorizer())
            .build());
      }
    `
    },
    {
      name: 'benchmarkOnFind',
      javaCode: `
      getDao().inX(getX()).select(new ArraySink());
      `
    },
    {
      name: 'benchmarkOnPut',
      javaCode: `
      for (int i = 1; i < getRecordAmount() + 1; i++) {
        User user = TestUtils.createTestUser();
        user.setId(i);
        user.setEmail(i + user.getEmail());
        try {
          getDao().inX(getX()).put(user);
        } catch (Exception e) {}
      }
      `
    },
    {
      name: 'benchmarkOnRemove',
      javaCode: `
      for (int i = 1; i < getRecordAmount() + 1; i++) {
        User user = TestUtils.createTestUser();
        user.setId(i);
        user.setEmail(i + user.getEmail());
        try {
          getDao().inX(getX()).remove(user);
        } catch (Exception e) {}
      }
      `
    },
    {
      name: 'execute',
      javaCode: `
      if ( getDop() == foam.dao.DOP.FIND ) benchmarkOnFind();
      if ( getDop() == foam.dao.DOP.PUT ) benchmarkOnPut();
      if ( getDop() == foam.dao.DOP.REMOVE ) benchmarkOnRemove();
      `
    },
    {
      name: 'teardown',
      javaCode: `
      getDao().inX(x).removeAll();
      `
    }
  ]
});
