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
  name: 'BusinessSummaryReport',

  documentation: `
    ============ Business Summary Report for Leadership =============
    Summary table index would be:
    [TYPE\\DATE]            Daily  Yesterday  Weekly  Month-to-Date  Last Month  Year-to-Date  Total
    Registration          |
    Application Submitted |
    Approved              |
    Active                |
    Declined              |
    Locked                |
  `,

  tableColumns: [
    'typeDate',
    'daily',
    'yesterday',
    'weekly',
    'monthToDate',
    'lastMonth',
    'yearToDate',
    'total'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'fake id which is used to make the lines considered different',
      visibility: 'HIDDEN'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.reports.RowOfBusSumReports',
      name: 'typeDate',
      visibility: 'RO',
      tableWidth: 200,
      tableCellFormatter: function(state) {
        this.add(state.label);
      },
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("[TYPE\\DATE]");
      }
    },
    {
      class: 'Long',
      name: 'daily',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'yesterday',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'weekly',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'monthToDate',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'lastMonth',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'yearToDate',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'total'
    }
  ]
});
