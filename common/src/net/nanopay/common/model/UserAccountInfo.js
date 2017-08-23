foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'UserAccountInfo',
  implements: [ 'net.nanopay.common.model.AccountInfo'],

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'tag'
    },
    {
      class: 'Int',
      name: 'balance'
    },
  ]
});
