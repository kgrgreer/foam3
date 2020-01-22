foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidTransactionAuthorizer',
  extends: 'net.nanopay.liquidity.crunch.LiquidAuthorizer',
  implements: [ 'foam.nanos.auth.Authorizer' ],

  javaImports: [
    'foam.mlang.Constant',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'checkPredicateForAccount',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate'
        }
      ],
      javaType: 'boolean',
      javaCode: `
        if ( predicate == null ) return false;
        if ( predicate instanceof Eq ) {
          Eq eq = (Eq) predicate;
          if ( eq.getArg1().toString().equals("net.nanopay.tx.model.Transaction.destinationAccount") || eq.getArg1().toString().equals("net.nanopay.tx.model.Transaction.sourceAccount") ) {
            Constant    c              = (Constant) eq.getArg2();
            Long        accountId      = (Long) c.getValue();
            String      readPermission = createPermission(getPermissionPrefix(), "view", accountId);
            AuthService authService    = (AuthService) x.get("auth");

            return authService.check(x, readPermission);
          }
          return false;
        }
        if ( predicate instanceof And ) {
          And and = (And) predicate;
          int length = and.getArgs().length;
          for ( int i = 0; i < length; i++ ) {
            Predicate arg = and.getArgs()[i];
            if ( checkPredicateForAccount(x, arg) ) return true;
          }
          return false;
        }
        if ( predicate instanceof Or ) {
          Or or = (Or) predicate;
          int length = or.getArgs().length;
          for ( int i = 0; i < length; i++ ) {
            Predicate arg = or.getArgs()[i];
            if ( checkPredicateForAccount(x, arg) ) return true;
          }
          return false;
        }
        return false;
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        return checkPredicateForAccount(x, predicate);
    `
    },
    {
      name: 'authorizeOnRead',
      javaCode:  `
        Long accountId = ((Transaction) obj).getDestinationAccount();
        String readPermission = createPermission(getPermissionPrefix(), "view", accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, readPermission) ) {
          super.authorizeOnRead(x, obj);
        }
      `
    }
  ]
})
