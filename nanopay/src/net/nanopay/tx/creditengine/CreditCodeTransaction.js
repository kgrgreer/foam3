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
  package: 'net.nanopay.tx.creditengine',
  name: 'CreditCodeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  documentation: `This transaction is used for managing the balance in credit code accounts.
  All it does is try to increment or decrement the balance of the "applicable account" the applicable account
  is the SourceAccount, and the amount is the "amount".
  `,

  javaImports: [
    'foam.core.ValidationException',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
  ],

  imports: [
    'unitDAO'
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'CreditCode Usage Increment/Decrement';
      },
      javaFactory: `
        return "CreditCode Usage Increment/Decrement";
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
      includeInDigest: true,
      aliases: ['sourceDenomination'],
      section: 'transactionInformation',
      order: 60,
      gridColumns: 6,
      documentation: 'Source currency',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      javaFactory: `
        return "use";
      `,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.unitDAO,
          objToChoice: function(unit) {
            return [unit.id, unit.id];
          }
        });
      }
    },
        {
          class: 'UnitValue',
          name: 'amount',
          unitPropName: 'sourceCurrency',
          label: 'Payer Amount',
          section: 'transactionInformation',
          order: 50,
          gridColumns: 6,
          createVisibility: 'RO',
          readVisibility: 'RO',
          updateVisibility: 'RO',
          documentation: `Amount withdrawn from the payer's account (source account) in the source currency.`,
          help: `This is the amount withdrawn from the payer's chosen account (Source Account).`,
          view: function(_, X) {
            return {
              class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
              linkCurrency$: X.data.destinationCurrency$,
              currency$: X.data.sourceCurrency$,
              linkAmount$: X.data.destinationAmount$
            };
          },
          unitPropValueToString: async function(x, val, unitPropName) {
            var unitProp = await x.unitDAO.find(unitPropName);
            if ( unitProp )
              return unitProp.format(val);
            return val;
          },
          tableCellFormatter: function(value, obj) {
            obj.unitDAO.find(obj.sourceCurrency).then(function(c) {
              if ( c ) {
                this.add(c.format(value));
              }
            }.bind(this));
          },
          javaToCSV: `
            DAO currencyDAO = (DAO) x.get("unitDAO");
            String srcCurrency = ((Transaction)obj).getSourceCurrency();
            foam.core.Currency currency = (foam.core.Currency) currencyDAO.find(srcCurrency);

            // Outputting two columns: "amount", "Currency"
            outputter.outputValue(currency.formatPrecision(get_(obj)));
            outputter.outputValue(srcCurrency);
          `,
          javaToCSVLabel: `
            // Outputting two columns: "amount", "Currency"
            outputter.outputValue("Source Amount");
            outputter.outputValue("Source Currency");
          `,
          includeInDigest: true,
          validationPredicates: [
            {
              args: ['amount'],
              predicateFactory: function(e) {
                return e.GTE(net.nanopay.tx.model.Transaction.AMOUNT, 0);
              },
              errorMessage: 'INVALID_AMOUNT'
            },
            {
              args: ['amount', 'destinationAmount'],
              predicateFactory: function(e) {
                return e.NOT(e.AND(
                  e.EQ(net.nanopay.tx.model.Transaction.AMOUNT, 0),
                  e.EQ(net.nanopay.tx.model.Transaction.DESTINATION_AMOUNT, 0)
                ));
              },
              errorMessage: 'BOTH_INVALID_AMOUNT'
            }
          ]
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
      CreditCodeAccount account = (CreditCodeAccount) findSourceAccount(x);
      if ( getSourceAccount() == null ) {
        throw new ValidationException("CreditCode account not found");
      }
      if ( ! (findSourceAccount(x) instanceof CreditCodeAccount) ) {
        throw new ValidationException("This Source account type should not be set");
      }
      if ( ! (findDestinationAccount(x) instanceof CreditCodeAccount) ) {
        throw new ValidationException("This Destination account type should not be set");
      }
      /*if ( destinationAccount() != null ) {
        throw new ValidationException("destination account should not be set");
      }*/
      `
    },
  ]
});
