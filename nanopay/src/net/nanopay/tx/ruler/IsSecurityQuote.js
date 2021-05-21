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
  package: 'net.nanopay.tx.ruler',
  name: 'IsSecurityQuote',

  documentation: 'A predicate that ensures the object is a securities transaction quote',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.tx.TransactionQuote'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        if ( ! ( nu instanceof TransactionQuote ) ) return false;
        TransactionQuote tq = (TransactionQuote) nu;

        if ( tq.getSourceAccount() instanceof SecuritiesAccount &&
          tq.getDestinationAccount() instanceof SecuritiesAccount )
          return true;

        return false;

      `
    }
  ]
});
