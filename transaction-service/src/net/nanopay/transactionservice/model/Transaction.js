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
      class: 'Currency',
      name: 'amount'
    },
    {
      class: 'DateTime',
      name: 'date',
      label: 'Date & Time'
    },
    {
      class: 'Currency',
      name: 'tip'
    },
    {
      class: 'Double',
      name: 'rate'
    },
    {
      class: 'Currency',
      name: 'fees'
    },
    // TODO: field for tax as well? May need a more complex model for that
    {
      class: 'Currency',
      name: 'total',
      expression: function (amount, tip, fees) {
        return amount + tip + fees;
      }
    }
  ]
});
