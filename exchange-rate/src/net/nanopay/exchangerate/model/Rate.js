foam.CLASS({
  package: 'net.nanopay.exchangerate.model',
  name: 'Rate',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'to'
    },
    {
      class: 'Long',
      name: 'rate'
    },
    {
      class: 'DateTime',
      name: 'expirationDate'
    }
  ]
});
