foam.INTERFACE({
  package: 'net.nanopay.integration',
  name: 'IntegrationService',
  documentation: 'System that allows the user to verify whether they are signed into the correct system as well as syncing to system seemlessly',

  methods: [
    {
      name: 'isSignedIn',
      async: true,
      returns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'contactSync',
      async: true,
      returns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'invoiceSync',
      async: true,
      returns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'syncSys',
      async: true,
      returns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'removeToken',
      async: true,
      returns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'pullBanks',
      async: true,
      javaReturns: 'java.util.List<net.nanopay.integration.AccountingBankAccount>',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
        },
      ]
    },
  ]
});
