foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'AcceptRateApiModel',

  documentation: 'service ExchageRate for Interac',

  javaImports: [
    'java.util.Date'
  ],

  requires: [
     'net.nanopay.fx.interac.model.AcceptExchangeRateFields'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'endToEndId'
    },
    {
      class: 'String',
      name: 'transactionId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.AcceptExchangeRateFields',
      name: 'exchangeRate',
      factory: function() {
        return this.AcceptExchangeRateFields.create();
      }
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'AcceptExchangeRateFields',

  properties: [
      {
        class: 'String',
        name: 'dealReferenceNumber'
      },
      {
        class: 'String',
        name: 'fxStatus',
        value: 'Booked'
      }
  ]
});
