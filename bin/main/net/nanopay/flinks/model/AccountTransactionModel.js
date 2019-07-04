foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountTransactionModel',

  documentation: 'model for the Flinks account transaction model',

  properties: [
    {
      class: 'String',
      name: 'Date'
    },
    {
      class: 'String',
      name: 'Code'
    },
    {
      class: 'String',
      name: 'Description'
    },
    {
      class: 'Double',
      name: 'Debit'
    },
    {
      class: 'Double',
      name: 'Credit'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});