foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingResultReport',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Date',
      name: 'time'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.ResultResponse',
      name: 'resultResponse'
    },
  ]
});
