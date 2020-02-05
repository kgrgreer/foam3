foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AggregateAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'Calculates balance of all children accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.fx.ExchangeRate',
  ],

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.fx.ExchangeRate'
  ],

  properties: [
    {
      name: 'denomination',
      updateMode: 'RW'
    },
    {
      name: 'liquiditySetting',
      createMode: 'HIDDEN',
      updateMode: 'HIDDEN',
      readMode: 'HIDDEN'
    }
  ]
});

