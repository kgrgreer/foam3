foam.INTERFACE({
  package: 'net.nanopay.fx.afex',
  name: 'AFEX',

  documentation: 'Interface to the AFEX service',

  methods: [
    {
      name: 'getToken',
      async: true,
      type: 'net.nanopay.fx.afex.Token'
    },
    {
      name: 'getQuote',
      async: true,
      type: 'net.nanopay.fx.afex.GetQuoteResponse',
      args: [
        // {
        //   type: 'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
        //   name: 'request'
        // }
      ]
    },
    {
      name: 'getValueDate',
      async: true,
      type: 'net.nanopay.fx.afex.GetQuoteResponse',
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
      type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationResult',
      args: [
        // {
        //   name: 'request',
        //   type: 'net.nanopay.fx.ascendantfx.model.PayeeOperationRequest'
        // }
      ]
    }
  ]
});
