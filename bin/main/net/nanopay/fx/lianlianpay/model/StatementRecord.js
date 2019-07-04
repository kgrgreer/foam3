foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'StatementRecord',

  documentation: 'Represents a statement record',

  properties: [
    {
      class: 'String',
      name: 'serialNumber',
      documentation: 'Unique identity per each fund in / out'
    },
    {
      class: 'String',
      name: 'billTime',
      documentation: 'Fund billing time. Format is YYMMDDHHMMSS'
    },
    {
      class: 'Int',
      name: 'type',
      documentation: 'Transaction type of each fund in / out'
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency type'
    },
    {
      class: 'Float',
      name: 'amount',
      documentation: 'Fund in / out amount, fund out amount with negative number'
    },
    {
      class: 'String',
      name: 'memo',
      documentation: 'Description of the fund in / out',
      required: false
    }
  ]
});