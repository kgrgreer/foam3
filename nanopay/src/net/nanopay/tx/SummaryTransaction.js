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
  name: 'SummaryTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  
  documentation: 'Used solely to present a summary of LineItems for chained Transactions',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.integration.ErrorCode',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.ChainSummary',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.PartnerTransaction',
    'net.nanopay.tx.ValueMovementTransaction',
    'static foam.mlang.MLang.EQ'
  ],

  mixins: [
    'net.nanopay.tx.SummarizingTransactionMixin'
  ],

  sections: [
    {
      name: 'transactionChainSummaryInformation',
      title: 'Transaction Status Summary',
      help: 'Transaction chain information can be added here',
      order: 15
    }
  ],

  properties: [
    {
      name: 'chainSummary',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.ChainSummary',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      name: 'depositAmount',
      class: 'UnitValue',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      name: 'withdrawalAmount',
      class: 'UnitValue',
      storageTransient: true,
      visibility: 'RO',
      section: 'transactionChainSummaryInformation'
    },
    {
      name: 'status',
      value: 'PENDING',
    }
  ],

  methods: [
     {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    }
  ]
});
