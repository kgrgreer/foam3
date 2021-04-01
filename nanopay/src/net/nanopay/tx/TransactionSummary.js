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
  package: 'net.nanopay.tx',
  name: 'TransactionSummary',

  documentation: `This model represents the summary of a transaction`,

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'summary',
    'category',
    'status',
    'errorCode',
    'created'
  ],

  searchColumns: [
    'id',
    'summary',
    'amount',
    'status',
    'category',
    'errorCode',
    'created',
    'payee',
    'payer'
  ],

  sections: [
    {
      name: 'transactionInformation'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'summary',
      label: 'Transaction Summary',
      section: 'transactionInformation',
      order: 10,
      gridColumns: 6,
      tableWidth: 400
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'id',
      section: 'transactionInformation',
      order: 20,
      gridColumns: 6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    },
    {
      class: 'UnitValue',
      name: 'amount',
      section: 'transactionInformation',
      order: 30,
      gridColumns: 6,
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      }
    },
    {
      class: 'String',
      name: 'currency',
      section: 'transactionInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'category',
      section: 'transactionInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'transactionInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'net.nanopay.integration.ErrorCode',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      section: 'transactionInformation',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'errorInfo',
      label: 'Error Description',
      section: 'transactionInformation',
      order: 80,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'transactionInformation',
      order: 90,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      section: 'transactionInformation',
      order: 100,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      name: 'payer',
      section: 'transactionInformation',
      order: 110,
      gridColumns: 6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      name: 'payee',
      section: 'transactionInformation',
      order: 120,
      gridColumns: 6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        return this.summary;
      },
      javaCode: `
        return getSummary();
      `
    },
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

        if ( transaction.getDestinationAmount() > 0 ) {
          if ( summary.length() > 0 ) summary.append(" → ");
          
          if ( SafetyUtil.isEmpty(transaction.getDestinationCurrency()) ) {
            summary.append(transaction.getDestinationAmount());
          } else if ( destinationCurrency == null) {
            summary.append(transaction.getDestinationAmount())
              .append(" ")
              .append(transaction.getDestinationCurrency());
          } else {
            summary.append(destinationCurrency.format(transaction.getDestinationAmount()));
          }
        }

        if ( transaction.getPayer() != null && transaction.getPayee() != null ) {
          summary.append(" | ")
            .append(transaction.getPayer().getDisplayName())
            .append(" → ")
            .append(transaction.getPayee().getDisplayName());
        }

        return summary.toString();
      `
    }
  ]
});
