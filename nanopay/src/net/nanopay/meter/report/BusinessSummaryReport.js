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
      class: 'String',
      name: 'typeDate',
      visibility: 'RO',
      tableWidth: 200,
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
