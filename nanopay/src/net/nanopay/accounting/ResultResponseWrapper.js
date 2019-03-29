foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'ResultResponseWrapper',

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
      class: 'String',
      name: 'method'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.ResultResponse',
      name: 'resultResponse'
    },
  ]
});
