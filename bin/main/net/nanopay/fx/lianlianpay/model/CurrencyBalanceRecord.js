foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'CurrencyBalanceRecord',

  documentation: 'Represents a currency balance record',

  properties: [
    {
      class: 'String',
      name: 'asOfDate',
      documentation: 'Statement date, i.e. previous accounting date, format is YYYMMDD'
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency type'
    },
    {
      class: 'Float',
      name: 'balance',
      documentation: 'Currency balance'
    }
  ]
});
