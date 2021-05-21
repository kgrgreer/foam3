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
  package: 'net.nanopay.tx.planner.fees',
  name: 'AbliiFeeRule',

  documentation: `
      Rule that adds fees for Ablii transactions
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem'
  ],

  properties: [
    {
      class: 'Long',
      name: 'domesticFee',
      value: 75
    },
    {
      class: 'Long',
      name: 'internationalFee',
      value: 500
    }

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction tx = (Transaction) obj;
        Boolean sameCurrency = tx.findSourceAccount(x).getDenomination().equals(tx.findDestinationAccount(x).getDenomination());
        Long feeAmount = sameCurrency ? getDomesticFee() : getInternationalFee();
        Currency currency = (Currency) ((DAO) x.get("currencyDAO")).find(tx.getSourceCurrency());
        tx.addLineItems(new TransactionLineItem[] {new InvoicedFeeLineItem.Builder(getX()).setGroup("InvoiceFee").setAmount(feeAmount).setCurrency(tx.getSourceCurrency()).setFeeCurrency(currency).build()});
      `
    }
  ]
});
