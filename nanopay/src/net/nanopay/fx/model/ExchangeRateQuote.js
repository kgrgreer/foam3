/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ExchangeRateQuote',

  requires: [
     'net.nanopay.fx.model.ExchangeRateFields',
     'net.nanopay.fx.model.FeesFields',
     'net.nanopay.fx.model.DeliveryTimeFields'
  ],

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.model.ExchangeRateFields',
      name: 'exchangeRate',
      factory: function() {
        return this.ExchangeRateFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.model.FeesFields',
      name: 'fee',
      factory: function() {
        return this.FeesFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.model.DeliveryTimeFields',
      name: 'deliveryTime',
      factory: function() {
        return this.DeliveryTimeFields.create();
      }
    },
    // {
    //   class: 'Double',
    //   name: 'feesAmount'
    // },
    // {
    //   class: 'Double',
    //   name: 'feesPercentage'
    // },
    // {
    //   class: 'Long',
    //   name: 'amount',
    //   value: 0
    // }
  ]
});


foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ExchangeRateFields',

  properties: [
      {
        class: 'Double',
        name: 'rate'
      },
      {
        class: 'String',
        name: 'dealReferenceNumber',
      },
      {
        class: 'String',
        name: 'fxStatus',
      },
      {
        class: 'DateTime',
        name: 'expirationTime'
      },
      {
        class: 'DateTime',
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
      }
  ]
});


foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'FeesFields',

  properties: [
    {
      class: 'Double',
      name: 'totalFees'
    },
    {
      class: 'String',
      name: 'totalFeesCurrency'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'DeliveryTimeFields',

  properties: [
    {
      class: 'DateTime',
      name: 'processDate'
    }
  ]
});
