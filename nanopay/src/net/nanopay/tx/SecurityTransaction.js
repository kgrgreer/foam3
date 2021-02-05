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
  package: 'net.nanopay.tx',
  name: 'SecurityTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.core.ValidationException',
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
      class: 'String',
      name: 'sourceCurrency',
      aliases: ['sourceDenomination'],
      visibility: 'RO',
      factory: function() {
        return this.ctrl.homeDenomination ? 'fail' : 'NANO.TO';
      },
      javaFactory: `
        return "NANO.TO";
      `,
      includeInDigest: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.securitiesDAO,
          objToChoice: function(unit) {
            return [unit.id, unit.id];
          }
        });
      }
    },
    {
      class: 'UnitValue',
      name: 'amount',
      required: true,
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
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.securitiesDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
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
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.securitiesDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
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
    {
      class: 'String',
      name: 'summary',
      createVisibility: 'HIDDEN',
      readVisibility: function(summary) {
        return summary ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function(summary) {
        return summary ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of Transactions.
      `,
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
            sourceCurrency,
            destinationCurrency,
            securitiesDAO,
            homeDenomination  /* Do not remove b/c the cell needs to re-render if homeDenomination changes */
          ) {
            return Promise.all([
              securitiesDAO.find(sourceCurrency),
              securitiesDAO.find(destinationCurrency)
            ]).then(([srcCurrency, dstCurrency]) => {
              let output = '';

              if ( sourceCurrency === destinationCurrency ) {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
              } else {
                output += srcCurrency ? srcCurrency.format(obj.amount) : `${obj.amount} ${sourceCurrency}`;
                output += ' → ';
                output += dstCurrency
                            ? dstCurrency.format(obj.destinationAmount)
                            : `${obj.destinationAmount} ${destinationCurrency}`;
              }

              if ( obj.payer && obj.payee ) {
                output += (' | ' + obj.payer.displayName + ' → ' + obj.payee.displayName);
              }

              return output;
            });
        }));
      },
      tableWidth: 250,
    },
  ],

  methods: [
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
        throw new ValidationException("instanceof SecurityTransaction cannot be updated.");
      }
      `
    },
  ]
});
