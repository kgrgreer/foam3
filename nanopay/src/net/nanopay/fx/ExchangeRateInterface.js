foam.INTERFACE({
  package: 'net.nanopay.fx',
  name: 'ExchangeRateInterface',

  methods: [
    {
      name: 'getRateFromSource',
      returns: 'net.nanopay.fx.ExchangeRateQuote',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'String',
          name: 'sourceCurrency',
        },
        {
          type: 'String',
          name: 'targetCurrency',
        },
        {
          type: 'Double',
          name: 'sourceAmount',
        },
        {
          type: 'String',
          name: 'valueDate',
        }
      ]
    },
    {
      name: 'getRateFromTarget',
      returns: 'net.nanopay.fx.ExchangeRateQuote',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'String',
          name: 'sourceCurrency',
        },
        {
          type: 'String',
          name: 'targetCurrency',
        },
        {
          type: 'Double',
          name: 'targetAmount',
        },
        {
          type: 'String',// 'java.util.Date'
          name: 'valueDate',
        }
      ]
    },
    {
      name: 'fetchRates',
      javaThrows: ['java.lang.RuntimeException'],
    },
    {
      name: 'acceptRate',
      returns: 'net.nanopay.fx.interac.model.AcceptRateApiModel',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'String',
          name: 'endToEndId',
        },
        {
          type: 'String',
          name: 'dealRefNum',
        }
      ]
    }
  ]
});
