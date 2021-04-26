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
  package: 'net.nanopay.meter.report',
  name: 'PaymentSummaryReport',

  documentation: `
    ============ Payment Summary Report for Leadership =============
    Summary table index would be:
    [TYPE\\DATE]                    Daily  Yesterday  Weekly  Month-to-Date  Last Month  Year-to-Date  Total
    Domestic Canada | In progress |
                    | Completed   |
    Domestic USA    | In progress |
                    | Completed   |
    International   | In progress |
                    | Completed   |
  `,

  tableColumns: [
    'typeDate',
    'status',
    'daily',
    'dailyAmount',
    'yesterday',
    'yesterdayAmount',
    'weekly',
    'weeklyAmount',
    'monthToDate',
    'monthToDateAmount',
    'lastMonth',
    'lastMonthAmount',
    'yearToDate',
    'yearToDateAmount',
    'total',
    'totalAmount'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'fake id which is used to make the objects considered different',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'typeDate',
      visibility: 'RO',
      tableWidth: 100,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("[TYPE\\DATE]");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.meter.report.ReportStatus',
      name: 'status',
      visibility: 'RO',
      tableWidth: 100,
      tableCellFormatter: function(state) {
        this.add(state.label)
      },
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("");
      }
    },
    {
      class: 'String',
      name: 'daily',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Daily");
      }
    },
    {
      class: 'String',
      name: 'dailyAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Daily Amount");
      }
    },
    {
      class: 'String',
      name: 'yesterday',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Yesterday");
      }
    },
    {
      class: 'String',
      name: 'yesterdayAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Yesterday Amount");
      }
    },
    {
      class: 'String',
      name: 'weekly',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Weekly");
      }
    },
    {
      class: 'String',
      name: 'weeklyAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Weekly Amount");
      }
    },
    {
      class: 'String',
      name: 'monthToDate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Month to Date");
      }
    },
    {
      class: 'String',
      name: 'monthToDateAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Month to Date Amount");
      }
    },
    {
      class: 'String',
      name: 'lastMonth',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Last Month");
      }
    },
    {
      class: 'String',
      name: 'lastMonthAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Last Month Amount");
      }
    },
    {
      class: 'String',
      name: 'yearToDate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Year to Date");
      }
    },
    {
      class: 'String',
      name: 'yearToDateAmount',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Year to Date Amount");
      }
    },
    {
      class: 'String',
      name: 'total',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Total");
      }
    },
    {
      class: 'String',
      name: 'totalAmount',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Total Amount");
      }
    }
  ]
});
