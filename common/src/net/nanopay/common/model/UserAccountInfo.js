foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'UserAccountInfo',
  extends: 'net.nanopay.common.model.AccountInfo',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'tag'
    },
    {
      class: 'Long',
      name: 'balance'
    },
  ]
});
