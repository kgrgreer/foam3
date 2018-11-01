foam.CLASS({
  package: 'net.nanopay.model',
  name: 'ClientUserJunction',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'FObjectProperty',
      name: 'accessGroup'
    },
    {
      class: 'String',
      name: 'status'
    }
  ]
});
