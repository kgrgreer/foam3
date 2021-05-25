/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.partner.intuit.tx',
  name: 'IntuitFeeTransactionSummary',
  extends: 'net.nanopay.partner.intuit.tx.IntuitTransactionSummary',

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
      'amount',
      'payer',
      'category',
      'status',
      'externalId',
      'created',
      'errorCode'
    ],

    searchColumns: [
      'id',
      'name',
      'summary',
      'amount',
      'status',
      'category',
      'errorCode',
      'created',
      'payer',
      'externalId',
      'externalInvoiceId'
    ],

  properties: [
    {
      name: 'payee',
      hidden: true
    },
    {
      class: 'String',
      name: 'fee',
      hidden: true
     },
    {
      name: 'associate',
      label: 'Principal Transaction',
      class: 'String',
      section: 'transactionInformation',
      order: 160,
      gridColumns: 6
    }
  ],

  methods: [
    {
      name: 'summarizeTransaction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'transaction', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'String',
      javaCode: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        Currency sourceCurrency = (Currency) currencyDAO.find(transaction.getSourceCurrency());
        Currency destinationCurrency = (Currency) currencyDAO.find(transaction.getDestinationCurrency());
        StringBuilder summary = new StringBuilder();
        summary.append("Transaction Fee of ");
        if ( transaction.getAmount() > 0 ) {
          if ( SafetyUtil.isEmpty(transaction.getSourceCurrency()) ) {
            summary.append(transaction.getAmount());
          }
          else if ( sourceCurrency == null ) {
            summary.append(transaction.getAmount())
              .append(" ")
              .append(transaction.getSourceCurrency());
          }
          else {
            summary.append(sourceCurrency.format(transaction.getAmount()));
          }
        }

        if ( transaction.getPayer() != null && transaction.getPayee() != null ) {
            summary.append(" for ");
            summary.append(transaction.getPayer().getDisplayName());
        }

        return summary.toString();
      `
    }
  ]
});
