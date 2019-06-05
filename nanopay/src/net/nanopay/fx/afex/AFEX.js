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
      name: 'getValueDate',
      async: true,
      type: 'net.nanopay.fx.afex.Quote',
      args: [
        // {
        //   type: 'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
        //   name: 'request'
        // }
      ]
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
    }
  ]
});
