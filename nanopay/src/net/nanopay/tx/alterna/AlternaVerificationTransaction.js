foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaVerificationTransaction',
  extends: 'net.nanopay.tx.alterna.AlternaCITransaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException'
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `

      if ( getSourceAccount() == 0 ) {
        throw new RuntimeException("sourceAccount must be set");
      }

      if ( getDestinationAccount() == 0 ) {
        throw new RuntimeException("destinationAccount must be set");
      }

      if ( getPayerId() != 0 ) {
        if ( findSourceAccount(x).getOwner() != getPayerId() ) {
          throw new RuntimeException("sourceAccount doesn't belong to payer");
        }
      }

      if ( getPayeeId() != 0 ) {
        if ( findDestinationAccount(x).getOwner() != getPayeeId() ) {
          throw new RuntimeException("destinationAccount doesn't belong to payee");
        }
      }

      if ( findSourceAccount(x).findOwner(x) == null ) {
        throw new RuntimeException("Payer user doesn't exist");
      }

      if ( findDestinationAccount(x).findOwner(x) == null ) {
        throw new RuntimeException("Payee user doesn't exist");
      }

      if ( ! findSourceAccount(x).findOwner(x).getEmailVerified() ) {
        throw new AuthorizationException("You must verify email to send money.");
      }

      if ( ! findDestinationAccount(x).findOwner(x).getEmailVerified() ) {
        throw new AuthorizationException("Receiver must verify email to receive money.");
      }

      if ( getAmount() < 0) {
        throw new RuntimeException("Amount cannot be negative");
      }

      if ( getAmount() == 0) {
        throw new RuntimeException("Amount cannot be zero");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getSourceCurrency()) == null ) {
        throw new RuntimeException("Source currency is not supported");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getDestinationCurrency()) == null ) {
        throw new RuntimeException("Destination currency is not supported");
      }

      if ( getTotal() > 7500000 ) {
        throw new AuthorizationException("Transaction limit exceeded.");
      }
      `
    }
  ]
});
