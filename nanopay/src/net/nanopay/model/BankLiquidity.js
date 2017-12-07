foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankLiquidity',

  documentation: 'Bank Liquidity as per timing',

  properties: [
    {
      class: 'Long',
      name: 'balance'
    },
    {
      class: 'created',
      factory: function(){
        return new Date();
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'bank'
    }
  ]
})