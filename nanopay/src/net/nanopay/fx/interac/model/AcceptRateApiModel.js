foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'AcceptRateApiModel',

  documentation: 'service ExchageRate for Interac',

  javaImports: [
    'java.util.Date'
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
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.AcceptExchangeRateFields',
      name: 'exchangeRate',
      factory: function() {
        return this.AcceptExchangeRateFields.create();
      }
    }
  ]
});
