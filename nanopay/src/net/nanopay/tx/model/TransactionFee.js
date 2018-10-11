foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionFee',

  documentation: 'Holds Fee for Transactions.',

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name to identify transaction fee.'
    },
    {
      class: 'String',
      name: 'transactionClass',
      documentation: 'Describes which Transaction subclass fee should be applied to.'
    },
    {
      class: 'Currency',
      name: 'minAmount',
      documentation: 'Describes minimum amount this fee can be applied to.'
    },
    {
      class: 'Currency',
      name: 'maxAmount',
      documentation: 'Describes maximum amount this fee can be applied to.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Fee',
      name: 'fee',
      documentation: 'Fee class that should be applied to transaction.',
    },
  ]
 });
