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
      class: 'String',
      name: 'referenceNumber'
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
      name: 'sendingAmount'
    },
    {
      class: 'Long',
      name: 'receivingAmount'
    },
    {
      class: 'DateTime',
      name: 'date'
    },
    {
      class: 'Long',
      name: 'tip'
    },
    {
      class: 'Long',
      name: 'rate'
    },
    {
      class: 'Long',
      name: 'fees'
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
