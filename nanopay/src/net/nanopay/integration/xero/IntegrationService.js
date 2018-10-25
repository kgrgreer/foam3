foam.INTERFACE({
  package: 'net.nanopay.integration.xero',
  name: 'IntegrationService',
  documentation: 'System that allows the user to verify whether they are signed into the correct system as well as syncing to system seemlessly',

  methods: [
    {
      name: 'isSignedIn',
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.xero.model.XeroResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'contactSync',
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.xero.model.XeroResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'invoiceSync',
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.xero.model.XeroResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'syncSys',
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.xero.model.XeroResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
      ]
    },
    {
      name: 'removeToken',
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.xero.model.XeroResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          of: 'foam.nanos.auth.User',
        },
      ]
    },
  ]
});
