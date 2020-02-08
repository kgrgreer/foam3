foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'RootAccounts', 

  ids: [ 'userId' ],

  properties: [  
    {
      name: 'userId',
      class: 'Long',
      required: true
    },
    { 
      name: 'rootAccounts',
      class: 'List',
      of: 'String',
      javaType: 'java.util.List<String>',
      required: true
    }
  ]
});
  
