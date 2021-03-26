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
  package: 'net.nanopay.partner.treviso.report',
  name: 'TrevisoTransactionReport',

  documentation: `
    A transaction report with the following columns:
    * Transaction ID
    * Date and Time
    * Sender
    * Source Currency
    * Receiver
    * Destination Currency
    * Total Fees
    * Spot Rate
    * Spread Rate
    * Total Amount
    * PTax Rate
    * Bank Fee
  `,

  tableColumns: [
    'id',
    'date',
    'payer',
    'sourceCurrency',
    'payee',
    'destinationCurrency',
    'totalFees',
    'spotRate',
    'spreadRate',
    'totalAmount',
    'pTaxRate',
    'bankFee'
  ],

  searchColumns: [
    'dateRange'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'dateRange',
      documentation: 'This is a "virtual" property for catching user\'s selection.',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'id',
      label: 'Transaction ID',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction ID");
      }
    },
    {
      class: 'String',
      name: 'date',
      label: 'Date',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Date and Time");
      }
    },
    {
      class: 'Long',
      name: 'payer',
      label: 'Sender',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Sender");
      }
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Source Currency");
      }
    },
    {
      class: 'Long',
      name: 'payee',
      label: 'Receiver',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Receiver");
      }
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Destination Currency");
      }
    },
    {
      class: 'String',
      name: 'totalFees',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Total Fees");
      }
    },
    {
      class: 'Double',
      name: 'spotRate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Spot Rate");
      }
    },
    {
      class: 'Double',
      name: 'spreadRate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Spread Rate");
      }
    },
    {
      class: 'Long',
      name: 'totalAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Total Amount");
      }
    },
    {
      class: 'Double',
      name: 'pTaxRate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("PTax Rate");
      }
    },
    {
      class: 'Double',
      name: 'bankFee',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Bank Fee");
      }
    }
  ]
});
