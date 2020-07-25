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

    If the 'value' property is set to false to it will test for international
    transaction instead.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.bank.BankAccount'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'value',
      value: true,
      documentation: 'Please see model documentation above.'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var transaction = (Transaction) obj;
        var sourceAccount = transaction.findSourceAccount(getX());
        var destinationAccount = transaction.findDestinationAccount(getX());

        return sourceAccount instanceof BankAccount
          && destinationAccount instanceof BankAccount
          && getValue() == ((BankAccount) sourceAccount).getCountry().equals(
            ((BankAccount) destinationAccount).getCountry());
      `,
      code: async function(obj) {
        var sourceAccount = await obj.sourceAccount$find;
        var destinationAccount = await obj.destinationAccount$find;

        return net.nanopay.bank.BankAccount.isInstance(sourceAccount)
          && net.nanopay.bank.BankAccount.isInstance(destinationAccount)
          && this.value === (sourceAccount.country === destinationAccount.country);
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    }
  ]
});
