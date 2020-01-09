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

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction'
  ],

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
    'sourceAccount',
    'destinationAccount',
    'sourceAmount',
    'sourceCurrency',
    'destinationAmount',
    'destinationCurrency'
  ],

  searchColumns: [
    'dateRange'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'dateRange',
      documentation: 'This is a "virtual" property for catching user\'s selection.'
    },
    {
      class: 'Long',
      name: 'invoiceId',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Invoice ID");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction Status");
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'state',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction State"); 
      }
    },
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Transaction ID");
      }
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Reference Number");
      }
    },
    {
      class: 'String',
      name: 'parent',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Parent");
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Created");
      }
    },
    {
      class: 'DateTime',
      name: 'processDate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Process Date");
      }
    },
    {
      class: 'DateTime',
      name: 'completionDate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Completion Date");
      }
    },
    {
      class: 'String',
      name: 'type',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Type");
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        if ( value ) this.start().add(value.id).end();
      },
      javaToCSVLabel: `
        outputter.outputValue("Sender User Id");
        outputter.outputValue("Sender Name");
        outputter.outputValue("Sender Email");
      `,
      javaToCSV: `
        User sender = ((Account)((Transaction)obj).findSourceAccount(x)).findOwner(x);
        outputter.outputValue(sender.getId());
        outputter.outputValue(sender.label());
        outputter.outputValue(sender.getEmail());
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        if ( value ) this.start().add(value.id).end();
      },
      javaToCSVLabel: `
        outputter.outputValue("Receiver User Id");
        outputter.outputValue("Receiver Name");
        outputter.outputValue("Receiver Email");
      `,
      javaToCSV: `
        User receiver = ((Account)((Transaction)obj).findDestinationAccount(x)).findOwner(x);
        outputter.outputValue(receiver.getId());
        outputter.outputValue(receiver.label());
        outputter.outputValue(receiver.getEmail());
      `,
    },
    {
      class: 'UnitValue',
      name: 'sourceAmount',
      unitPropName: 'sourceCurrency',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Source Amount");
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
      class: 'UnitValue',
      name: 'destinationAmount',
      unitPropName: 'destinationCurrency',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Destination Amount");
      }
    },
    {
      class: 'String',
      name: 'destinationCurrency',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Destination Currency");
      }
    }
  ]
})