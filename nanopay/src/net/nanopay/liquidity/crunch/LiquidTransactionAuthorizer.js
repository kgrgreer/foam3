/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
        String readPermission = createPermission("View", obj.getProperty("id"), accountId);
        AuthService authService = (AuthService) x.get("auth");

        if ( ! authService.check(x, readPermission) ) {
          throw new AuthorizationException();
        }
        
        super.authorizeOnRead(x, obj);
      `
    }
  ]
})
  