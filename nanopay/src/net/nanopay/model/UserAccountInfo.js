foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserAccountInfo',
  extends: 'net.nanopay.model.AccountInfo',

  properties: [
//    {
//      class: 'StringArray',
//      name: 'tag'
//    },
    {
      class: 'Long',
      name: 'balance'
    },
  ]
});
