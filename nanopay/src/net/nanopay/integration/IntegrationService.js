foam.INTERFACE({
  package: 'net.nanopay.integration',
  name: 'IntegrationService',

  documentation: `
    We integrate with a variety of accounting software. We create a service for
    each one that interacts with its specific API. This interface is a set of
    basic operations that each individual accounting integration service should
    be able to implement.
  `,

  methods: [
    {
      name: 'isSignedIn',
      documentation: `
        Returns true if the given user is signed in to the accounting software.
      `,
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
    {
      name: 'contactSync',
      documentation: `
        Syncs all of the given user's contacts with the accounting software.
      `,
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
    {
      name: 'invoiceSync',
      documentation: `
        Syncs all of the given user's invoices with the accounting software.
      `,
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
    {
      name: 'syncSys',
      documentation: `
        Syncs both the given user's invoices and contacts with the accounting
        software.
      `,
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
    {
      name: 'removeToken',
      documentation: `
        Signs the user out of the accounting software.
      `,
      returns: 'Promise',
      javaReturns: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
    {
      name: 'pullBanks',
      documentation: `
        Gets the list of bank accounts from the accounting software.
      `,
      returns: 'Promise',
      javaReturns: 'java.util.List<net.nanopay.integration.AccountingBankAccount>',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context?'
        },
      ]
    },
  ]
});
