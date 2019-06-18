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
          type: 'String',
          name: 'currencyPair'
        },
        {
          type: 'String',
          name: 'valueType'
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
    },
    {
      name: 'createTrade',
      documentation: 'Create a trade or outright forward to convert from one currency to another',
      async: true,
      type: 'net.nanopay.fx.afex.CreateTradeResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreateTradeRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'createPayment',
      documentation: 'Create scheduled payment',
      async: true,
      type: 'net.nanopay.fx.afex.CreatePaymentResponse',
      args: [
        {
          type: 'net.nanopay.fx.afex.CreatePaymentRequest',
          name: 'request'
        }
      ]
    }
  ]
});
