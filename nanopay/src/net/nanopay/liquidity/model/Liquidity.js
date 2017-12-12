foam.CLASS({
  package: 'net.nanopay.liquidity.model',
  name: 'Liquidity',

  documentation: 'Liquidity as per timing',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'balance'
    },
    {
      class: 'Date',
      name: 'created',
      factory: function(){
        return new Date();
      },
      javaFactory: 'return new Date();'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    }
  ]
})