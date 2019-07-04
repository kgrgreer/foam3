foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'ReconciliationRecord',

  documentation: 'Represents a reconciliation record',

  properties: [
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Merchant unique instruction number'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'sourceAmount',
      documentation: 'Source amount'
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Target currency'
    },
    {
      class: 'Float',
      name: 'targetAmount',
      documentation: 'Target amount'
    },
    {
      class: 'String',
      name: 'paymentCurrency',
      documentation: 'Payment currency'
    },
    {
      class: 'Float',
      name: 'paymentAmount',
      documentation: 'Payment amount'
    },
    {
      class: 'Float',
      name: 'rate',
      documentation: 'Settlement rate'
    },
    {
      class: 'String',
      name: 'result',
      documentation: 'Payment result',
    }
  ]
});
