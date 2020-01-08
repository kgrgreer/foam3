foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidTransactionAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
      'foam.nanos.auth.AuthorizationException',
      'foam.nanos.auth.AuthService',
      'net.nanopay.tx.model.Transaction'
    ],

  methods: [
    {
      name: 'authorizeOnRead',
      javaCode:  `

        Long accountId = ((Transaction) obj).getDestinationAccount();
        String readPermission = createPermission("View", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, readPermission) ) {
          super.authorizeOnRead(x, obj);
        }        
      `
    }
  ]
})
  