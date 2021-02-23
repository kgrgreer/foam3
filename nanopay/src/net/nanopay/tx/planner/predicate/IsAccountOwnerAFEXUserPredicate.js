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
  package: 'net.nanopay.tx.planner.predicate',
  name: 'IsAccountOwnerAFEXUserPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the payer is an AFEX User',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'net.nanopay.account.Account',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.tx.TransactionQuote',

    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      FObject nu  = (FObject) NEW_OBJ.f(obj);
      AFEXServiceProvider afexService = (AFEXServiceProvider) ((X) obj).get("afexServiceProvider");
      if ( nu instanceof TransactionQuote ) {
        TransactionQuote tq = (TransactionQuote) nu;
        Long owner = tq.getRequestOwner() != 0 ? tq.getRequestOwner(): tq.getSourceAccount().getOwner();
        return null != afexService.getAFEXUser(((X) obj), owner) ;
      } else if ( nu instanceof Account ) {
        Account account = (Account) nu;
        return null != afexService.getAFEXUser(((X) obj), account.getOwner());
      } else {
        return false;
      }
      
      `
    }
  ]
});