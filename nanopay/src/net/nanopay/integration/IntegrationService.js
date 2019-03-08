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
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      swiftThrows: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'contactSync',
      documentation: `
        Syncs all of the given user's contacts with the accounting software.
      `,
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      swiftThrows: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'invoiceSync',
      documentation: `
        Syncs all of the given user's invoices with the accounting software.
      `,
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      swiftThrows: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'syncSys',
      documentation: `
        Syncs both the given user's invoices and contacts with the accounting
        software.
      `,
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      swiftThrows: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'removeToken',
      documentation: `
        Signs the user out of the accounting software.
      `,
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'pullBanks',
      documentation: `
        Gets the list of bank accounts from the accounting software.
      `,
      async: true,
      javaType: 'java.util.List<net.nanopay.integration.AccountingBankAccount>',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
      ]
    },
    {
      name: 'reSyncInvoice',
      async: true,
      type: 'net.nanopay.integration.ResultResponse',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'net.nanopay.invoice.model.Invoice',
          name: 'invoice'
        }
      ]
    },
  ]
});
