foam.INTERFACE({
  package: 'net.nanopay.fx.afex',
  name: 'AFEX',

  documentation: 'Interface to the AFEX service',

  methods: [
    {
      name: 'getToken',
      documentation: 'Get token',
      async: true,
      type: 'net.nanopay.fx.afex.Token'
    },
    {
      name: 'addPayee',
      documentation: 'To add a new payee',
      async: true,
      type: 'net.nanopay.fx.afex.AddPayeeResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.AddPayeeRequest'
        }
      ]
    },
    {
      name: 'updatePayee',
      documentation: 'To update a given payee\'s information',
      async: true,
      type: 'net.nanopay.fx.afex.UpdatePayeeResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.fx.afex.UpdatePayeeRequest'
        }
      ]
    },
    {
      name: 'deletePayee',
      documentation: 'To delete a given payee',
      async: true,
      type: 'String',
      args: [
        {
          name: 'vendorId',
          type: 'String'
        }
      ]
    },
    {
      name: 'getPayeeInfo',
      documentation: 'Get information for a given payee',
      async: true,
      type: 'net.nanopay.fx.afex.GetPayeeInfoResponse',
      args: [
        {
          name: 'vendorId',
          type: 'String'
        }
      ]
    },
    {
      name: 'getValueDate',
      async: true,
      type: 'String',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetValueDateRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'getQuote',
      documentation: 'Get quote',
      async: true,
      type: 'net.nanopay.fx.afex.Quote',
      args: [
        {
          type: 'net.nanopay.fx.afex.GetQuoteRequest',
          name: 'request'
        }
      ]
    }
  ]
});
