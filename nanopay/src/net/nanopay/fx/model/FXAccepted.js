
foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'FXAccepted',

  requires: [
     'net.nanopay.fx.model.ExchangeRateFields'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'quoteId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.model.ExchangeRateFields',
      name: 'exchangeRate',
      factory: function() {
        return this.ExchangeRateFields.create();
      }
    }
  ]
});
