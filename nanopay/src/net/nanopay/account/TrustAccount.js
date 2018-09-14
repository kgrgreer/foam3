foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  properties: [
    {
      documentation: 'The Trust account mirrors a real world account, or an Account in another nanopay realm.',
      name: 'backingAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
    }
  ],

  methods: [
    {
      documentation: 'Trust account is the inverse of it\'s backing account, so is always negative',
      name: 'validateAmount',
      args: [
        {
          name: 'balance',
          javaType: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          javaType: 'Long'
        }
      ],
      javaCode: `
        if ( amount == 0 ) {
          throw new RuntimeException("Zero transfer disallowed.");
        }
        if ( amount > 0 &&
             amount > -balance.getBalance() ) {
          throw new RuntimeException("Invalid transfer, Trust account balance must remain <= 0. " + this.getClass().getSimpleName()+"."+getName());
        }
      `
    }
  ]
});
