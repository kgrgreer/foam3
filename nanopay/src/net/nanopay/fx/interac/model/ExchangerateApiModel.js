foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'ExchangerateApiModel',

  documentation: 'service ExchageRate for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.fx.ExchangeRateQuote'
  ],

  properties: [
    {
      class: 'String',
      name: 'valueDate'
    },
    {
      class: 'String',
      name: 'sourceCurrency'
    },
    {
      class: 'String',
      name: 'targetCurrency'
    },
    {
      class: 'Double',
      name: 'sourceAmount',
      value: 0
    },
    {
      class: 'Double',
      name: 'targetAmount',
      value: 0
    },
    {
      class: 'String',
      name: 'dealReferenceNumber',
      javaFactory: 'return java.util.UUID.randomUUID().toString().replace("-", "");'
    },
    {
      class: 'String',
      name: 'endToEndId'
    }
  ]
});
