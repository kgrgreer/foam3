foam.CLASS({
  package: 'net.nanopay.account',
  name: 'SecuritiesTrustAccount',
  extends: 'net.nanopay.account.SecuritiesAccount',

  documentation: 'The base model for storing all individual securities.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'foam.core.Currency'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination',
    'balance'
  ],

  properties: [

  ],

  methods: [

  ]
});
