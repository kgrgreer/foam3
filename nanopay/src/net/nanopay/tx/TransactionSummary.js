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
    'created'
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
      gridColumns: 6
    },
    {
      class: 'UnitValue',
      name: 'amount',
      section: 'transactionInformation',
      order: 30,
      gridColumns: 6
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
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      section: 'transactionInformation',
      order: 110,
      gridColumns: 6,
      view: function(_, x) {
        return _.displayName;
      },
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'n/a')
          .end()
        .end();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      section: 'transactionInformation',
      order: 120,
      gridColumns: 6,
      view: function(_, x) {
        return _.displayName;
      },
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'n/a')
          .end()
        .end();
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
    }
  ]
});
