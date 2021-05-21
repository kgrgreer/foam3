/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
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
            String        accountId      = (String) c.getValue();
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
        String accountId = ((Transaction) obj).getDestinationAccount();
        String readPermission = createPermission(getPermissionPrefix(), "view", accountId);
        AuthService authService = (AuthService) x.get("auth");

        // TODO: need to integrate after once we figure out integration
        if ( obj instanceof CITransaction || obj instanceof COTransaction ){
          return;
        }

        if ( ! authService.check(x, readPermission) ) {
          super.authorizeOnRead(x, obj);
        }
      `
    }
  ]
})
