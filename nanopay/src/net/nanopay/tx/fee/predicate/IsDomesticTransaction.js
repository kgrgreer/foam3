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
  package: 'net.nanopay.tx.fee.predicate',
  name: 'IsDomesticTransaction',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Test if the transaction is domestic i.e. sourceAccount
    country same as destinationAccount country.

    It throws when the sourceAccount or destinationAccount of the transaction is
    not a bank account and the caller eg. FeeEngine.execute() should catch it.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.bank.BankAccount'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var transaction = (Transaction) obj;
        var sourceAccount = (BankAccount) transaction.findSourceAccount(getX());
        var destinationAccount = (BankAccount) transaction.findDestinationAccount(getX());

        return sourceAccount.getCountry().equals(destinationAccount.getCountry());
      `,
      code: function(obj) {
        throw new Error('IsDomesticTransaction is not supported.');
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    }
  ]
});
