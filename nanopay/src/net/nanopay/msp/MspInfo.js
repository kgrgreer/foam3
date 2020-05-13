foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspInfo',
  ids: ['spid'],

  properties: [
    {
        class: 'String',
        name: 'spid',
    },
    {
        class: 'String',
        name: 'adminUserEmail'
    },
    {
        class: 'Password',
        name: 'adminUserPassword'
    },
    {
        class: 'String',
        name: 'adminUserFirstname'
    },
    {
        class: 'String',
        name: 'adminUserLastname'
    }
  ]
});
