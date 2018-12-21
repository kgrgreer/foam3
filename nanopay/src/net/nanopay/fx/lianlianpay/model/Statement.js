foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'Statement',

  documentation: 'Represents a statement',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.CurrencyBalanceRecord',
      name: 'currencyBalanceRecords',
      documentation: 'Array of currency balance records'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.StatementRecord',
      name: 'statementRecords',
      documentation: 'Array of statement records'
    }
  ]
});