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
  name: 'SameUserTxnPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  documentation: 'if we set sameUser == true, then predicate returns true if source/destination users are same. or true if both false',

  javaImports: [
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'sameUser',
      value: true,
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) NEW_OBJ.f(obj);
      if (getSameUser() == ( quote.getSourceAccount().getOwner() == (quote.getDestinationAccount().getOwner())))
        return true;
      return false;
      `
    }
  ]
});
