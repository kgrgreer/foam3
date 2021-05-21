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
  package: 'net.nanopay.tx',
  name: 'LabelLiquidSummaryAction',
  documentation: 'captures liquidSummaryTransactions without transactionType marked, and adds the most appropriate label',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.LiquidSummaryTransaction',
    'net.nanopay.tx.LiquidCashTransactionType',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquidSummaryTransaction lst = (LiquidSummaryTransaction) obj;
        if ( lst.findSourceAccount(x) instanceof BankAccount || lst.findDestinationAccount(x) instanceof BankAccount)
          lst.setTransactionType(LiquidCashTransactionType.CICO);
        else {
          if ( ! SafetyUtil.equals(lst.findSourceAccount(x).getDenomination(),lst.findDestinationAccount(x).getDenomination()) )
            lst.setTransactionType(LiquidCashTransactionType.FX_TRANSACTION);
          else {
            lst.setTransactionType(LiquidCashTransactionType.CASH);
          }
        }
      `
    }
  ]
});
