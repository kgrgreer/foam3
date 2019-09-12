foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'InvoiceLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      hidden: true
    },
    {
      class: 'String',
      name: 'group',
      label: 'Type'
    },
    {
      class: 'String',
      name: 'description',
      expression: function(transaction) {
        return transaction;
      }
    },
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'currency',
      value: 'CAD'
    }
  ],

  methods: [
    function toSummary() {
      return this.description;
    }
  ]
});
