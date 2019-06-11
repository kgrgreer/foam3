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
      class: 'DateTime',
      name: 'time'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.ResultResponse',
      name: 'resultResponse'
    },
  ]
});
