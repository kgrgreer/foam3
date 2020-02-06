foam.CLASS({
  package: 'net.nanopay.fx.mock',
  name: 'MockFXService',

  documentation: 'An impelementation of FXService that spoofs FX rates',

  implements: [
    'net.nanopay.fx.FXService'
  ],

  methods: [
    {
      name: 'getFXRate',
      code: (sourceCurrency, targetCurrency, sourceAmount, destinationAmount, fxDirection, valueDate, user, fxProvider) => {
        let constantRate = 1;
        return Promise.resolve({ rate: constantRate });
      }
    }
  ]
});
