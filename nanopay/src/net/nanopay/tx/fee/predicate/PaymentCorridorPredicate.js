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
  name: 'PaymentCorridorPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Tests transaction payment provider, source and target countries.',

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.payment.PaymentProviderAware',
    'java.util.Arrays'
  ],

  properties: [
    {
      class: 'String',
      name: 'paymentProvider'
    },
    {
      class: 'String',
      name: 'sourceCountry'
    },
    {
      class: 'String',
      name: 'targetCountry',
      documentation: 'Match a single target country'
    },
    {
      class: 'StringArray',
      name: 'targetCountryList',
      documentation: 'Match a list of target countries.'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var transaction = (Transaction) obj;
        var sourceAccount = (BankAccount) transaction.findSourceAccount(getX());
        var destinationAccount = (BankAccount) transaction.findDestinationAccount(getX());

        return transaction instanceof PaymentProviderAware
          && getPaymentProvider().equals(((PaymentProviderAware) transaction).getPaymentProvider())
          && getSourceCountry().equals(sourceAccount.getCountry())
          && ( getTargetCountry().equals(destinationAccount.getCountry())
            || Arrays.stream(getTargetCountryList()).anyMatch(c -> c.equals(destinationAccount.getCountry()))
          );
      `,
      code: function(obj) {
        throw new Error('PaymentCorridorPredicate is not supported.');
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      documentation: 'Disable deepClone to preserve the given context.',
      javaCode: 'return this;'
    }
  ]
});
