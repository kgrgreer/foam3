foam.CLASS({
  package: 'net.nanopay.fresh',
  name: 'FreshConfig',
  properties: [
    {
      class: 'String',
      name:'client_id',
      value: '36cfa4683f7996a1e042552a768e23840a36c66eb266a7251fbacdc17be8ef81'
    },
    {
      class: 'String',
      name:'client_secret',
      value: '50fec74a791852ecfc1f0600d6cbdda5543ddf0858264bab2964611a1131bf86'
    },
    {
      class: 'String',
      name:'redirect_uri',
      value: 'https://localhost:8080/service/fresh'
    },
    {
      class: 'String',
      name:'grant_type',
      value: 'authorization_code'
    },
    {
      class: 'String',      
      name:'code',
      value: ''
    },
  ]
})
