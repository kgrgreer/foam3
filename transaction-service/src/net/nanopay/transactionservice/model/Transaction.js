foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'Transaction',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'Long',
      name: 'payerId'
    },
    {
      class: 'Long',
      name: 'payeeId'
    },
    {
      class: 'Long',
      name: 'amount'
    },
    {
      class: 'DateTime',
      name: 'date'
    },
    {
      class: 'Long',
      name: 'tip'
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Long',
      name: 'total',
      expression: function (amount, tip) {
        return amount + tip;
      }
    }
  ]
});
