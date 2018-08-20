
foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXAccepted',

  requires: [
     'net.nanopay.fx.ExchangeRateFields'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'id',
      documentation: 'Refers to the Quote ID'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.ExchangeRateFields',
      name: 'exchangeRate',
      factory: function() {
        return this.ExchangeRateFields.create();
      }
    }
  ]
});
