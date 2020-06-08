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
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'B2BTransaction',

  documentation: 'Predicate for bank to bank transaction.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Transaction transaction = (Transaction) NEW_OBJ.f(obj);
        Account sourceAccount = transaction.findSourceAccount((X) obj);
        Account destinationAccount = transaction.findDestinationAccount((X) obj);

        return sourceAccount instanceof BankAccount
          && destinationAccount instanceof BankAccount;
      `
    }
  ]
});
