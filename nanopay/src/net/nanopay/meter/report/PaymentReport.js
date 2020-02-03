foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'PaymentReport',

  documentation: `
    A payment report with the following columns:
    * Invoice ID
    * Status
    * State
    * Transaction ID
    * Reference Number
    * Parent
    * Created
    * Process Date
    * Completion Date
    * Type
    * Source Account
    * Destination Account
    * Source Amount
    * Source Currency
    * Destination Amount
    * Destination Currency
  `,

  tableColumns: [
    'invoiceId',
    'status',
    'state',
    'id',
    'referenceNumber',
    'parent',
    'created',
    'processDate',
    'completionDate',
    'type',
    'senderUserId',
    'senderName',
    'receiverUserId',
    'receiverName',
    'sourceAmount',
    'sourceCurrency',
    'destinationAmount',
    'destinationCurrency'
  ],

  searchColumns: [
    'dateRange'
  ],

  css: `
    .foam-u2-view-TableView-net-nanopay-meter-report-PaymentReport {
      width: 1469px !important;
    }
  `,

  properties: [
    {
      class: 'DateTime',
      name: 'dateRange',
      documentation: 'This is a "virtual" property for catching user\'s selection.',
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'invoiceId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Invoice ID");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction Status");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'state',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction State"); 
      }
    },
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction ID");
      }
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Reference Number");
      }
    },
    {
      class: 'String',
      name: 'parent',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Parent");
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Created");
      }
    },
    {
      class: 'DateTime',
      name: 'processDate',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Process Date");
      }
    },
    {
      class: 'DateTime',
      name: 'completionDate',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Completion Date");
      }
    },
    {
      class: 'String',
      name: 'type',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Type");
      }
    },
    {
      class: 'Long',
      name: 'senderUserId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Sender User ID");
      }
    },
    {
      class: 'String',
      name: 'senderName',
      visibility: 'RO',
      tableWidth: 100,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Sender Name");
      }
    },
    {
      class: 'Long',
      name: 'receiverUserId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Receiver User ID");
      }
    },
    {
      class: 'String',
      name: 'receiverName',
      visibility: 'RO',
      tableWidth: 100,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Receiver Name");
      }
    },
    {
      class: 'UnitValue',
      name: 'sourceAmount',
      unitPropName: 'sourceCurrency',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Source Amount");
      }
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Source Currency");
      }
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      unitPropName: 'destinationCurrency',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Destination Amount");
      }
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Destination Currency");
      }
    }
  ]
})