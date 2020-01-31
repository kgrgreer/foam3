foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SecurityTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Digital Security Transfer';
      },
      javaFactory: `
    return "Digital Security Transfer";
      `,
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        return [
          'No status to choose.'
        ];
      }
    },
    {
      class: 'UnitValue',
      name: 'amount',
      label: 'Source Amount',
      section: 'amountSelection',
      required: true,
      gridColumns: 5,
      visibility: 'RO',
      help: `This is the amount to be withdrawn from payers chosen account (Source Account).`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkCurrency$: X.data.destinationCurrency$,
          currency$: X.data.sourceCurrency$,
          linkAmount$: X.data.destinationAmount$
        };
      },
      tableCellFormatter: function(value, obj) {
        obj.securitiesDAO.find(obj.sourceCurrency).then(function(s) {
          if ( s ) {
            this.add(s.format(value));
          } else {
            this.add(value);
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO securitiesDAO = (DAO) x.get("securitiesDAO");
        String srcSecurity = ((Transaction)obj).getSourceCurrency();
        net.nanopay.exchangeable.Security security = (net.nanopay.exchangeable.Security) securitiesDAO.find(srcSecurity);

        // Outputting two columns: "amount", "Security"
        // Hacky way of making get_(obj) into String below
        outputter.outputValue(security.format(get_(obj)));
        outputter.outputValue(srcSecurity);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Security"
        outputter.outputValue("Source Amount");
        outputter.outputValue("Source Security");
      `,
      includeInDigest: true
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      label: 'Destination Amount',
      gridColumns: 7,
      help: `This is the amount to be transfered to payees account (destination account).`,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkAmount$: X.data.amount$,
          linkCurrency$: X.data.sourceCurrency$,
          currency$: X.data.destinationCurrency$,
          linked: true
        };
      },
      documentation: 'Amount in Receiver Currency',
      section: 'amountSelection',
      tableCellFormatter: function(value, obj) {
        obj.securitiesDAO.find(obj.destinationCurrency).then(function(s) {
          if ( s ) {
            this.add(s.format(value));
          } else {
            this.add(value);
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO securitiesDAO = (DAO) x.get("securitiesDAO");
        String dstSecurity = ((Transaction)obj).getDestinationCurrency();
        net.nanopay.exchangeable.Security security = (net.nanopay.exchangeable.Security) securitiesDAO.find(dstSecurity);

        // Outputting two columns: "amount", "Security"
        outputter.outputValue(security.format(get_(obj)));
        outputter.outputValue(dstSecurity);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Security"
        outputter.outputValue("Destination Amount");
        outputter.outputValue("Destination Security");
      `
    },
  ],

  methods: [
    {
      name: 'createTransfers',
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
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return getTransfers();
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);

      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED ) {
        ((Logger) x.get("logger")).error("instanceof SecurityTransaction cannot be updated.");
        throw new RuntimeException("instanceof SecurityTransaction cannot be updated.");
      }
      `
    },
  ]
});
