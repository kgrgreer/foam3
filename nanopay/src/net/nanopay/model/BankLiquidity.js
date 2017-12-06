foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankLiquidity',

  documentation: 'Bank Liquidity as per timing'

  properties: [
    {
      class: 'Long',
      name: 'balance'
    },
    {
      class: 'createdAt',
      factory: function(){
        return new Date()
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.threshold',
      name: 'thresholdAtTime'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'bank'
    }
  ]
})