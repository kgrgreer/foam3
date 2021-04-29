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
  package: 'net.nanopay.tx.model',
  name: 'Transaction',
  plural: 'Transactions',

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.analytics.Foldable',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'accountDAO',
    'addCommas',
    'complianceHistoryDAO',
    'ctrl',
    'currencyDAO',
    'securitiesDAO',
    'group',
    'homeDenomination',
    'stack?',
    'user',
    'userDAO',
    'exchangeRateService'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.*',
    'java.util.Arrays',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.contacts.PersonalContact',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.InterestTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionException',
    'foam.core.ValidationException',
    'net.nanopay.account.Balance',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.tx.planner.AbstractTransactionPlanner'
  ],

  requires: [
   'net.nanopay.bank.CanReceiveCurrency',
   'net.nanopay.tx.ETALineItem',
   'net.nanopay.tx.FeeLineItem',
   'net.nanopay.tx.TransactionLineItem',
   'net.nanopay.tx.model.TransactionStatus',
   'net.nanopay.tx.HistoricStatus',
  ],

  constants: [
    {
      name: 'STATUS_BLACKLIST',
      javaType: 'Set<TransactionStatus>',
      javaValue: `Collections.unmodifiableSet(foam.util.Arrays.asSet(new Object[] {
        TransactionStatus.REFUNDED,
        TransactionStatus.PENDING
      }));`
    }
  ],

  searchColumns: [
    'type',
    'status',
    'created',
    'completionDate',
    'externalInvoiceId'
  ],

  tableColumns: [
    'type',
    'status',
    'sourceAccount.name',
    'summary',
    'destinationAccount.name',
    'created',
    'completionDate',
    'externalInvoiceId'
  ],

  sections: [
    {
      name: 'transactionInformation',
      order: 10
    },
    {
      name: 'lineItemsInformation',
      title: 'Additional Detail',
      permissionRequired: true,
      order: 20
    },
    {
      name: 'complianceInformation',
      title: 'Compliance',
      permissionRequired: true,
      order: 30,
    },
    {
      name: 'systemInformation',
      permissionRequired: true,
      order: 40
    },
    {
      name: 'deprecatedInformation',
      permissionRequired: true,
      order: 50
    }
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.OR(
          e.EQ(
            net.nanopay.tx.model.Transaction.STATUS,
            net.nanopay.tx.model.TransactionStatus.PENDING
          )
        )
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Completed',
      predicateFactory: function(e) {
        return e.AND(
          e.EQ(
            net.nanopay.tx.model.Transaction.STATUS,
            net.nanopay.tx.model.TransactionStatus.COMPLETED
          )
        )
      }
    }
  ],

  messages: [
    { name: 'INVALID_AMOUNT', message: 'Amount cannot be negative' },
    { name: 'BOTH_INVALID_AMOUNT', message: 'Both amount and destination amount cannot be 0' },
    { name: 'COMPLIANCE_HISTORY_MSG', message: 'Compliance History for' }
  ],

  // relationships: parent, children

  properties: [
    {
      class: 'String',
      name: 'id',
      label: 'ID',
      section: 'transactionInformation',
      order: 10,
      gridColumns: 6,
      documentation: 'ID of the transaction',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      javaJSONParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.json.StringParser())`,
      javaCSVParser: `new foam.lib.parse.Alt(new foam.lib.json.LongParser(), new foam.lib.csv.CSVStringParser())`,
      javaToCSVLabel: 'outputter.outputValue("Transaction ID");',
      includeInDigest: true
    },
    {
      name: 'name',
      class: 'String',
      section: 'transactionInformation',
      order: 20,
      gridColumns: 3,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      factory: function() {
        return this.type;
      },
      javaFactory: `
        return getType();
      `,
      includeInDigest: false,
      documentation: 'The type of the transaction.'
    },
    {
      name: 'type',
      class: 'String',
      section: 'transactionInformation',
      order: 25,
      gridColumns: 3,
      tableWidth: 190,
      storageTransient: true,
      getter: function() {
         return this.cls_.name;
      },
      javaToCSVLabel: 'outputter.outputValue("Transaction Type");',
      javaGetter: `
        return getClass().getSimpleName();
      `,
      includeInDigest: false
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payer',
      storageTransient: true,
      section: 'transactionInformation',
      order: 40,
      gridColumns: 3,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: x.data.payer$.map((p) => p ? [[p, p.toSummary()]] : [])
        };
      },
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
          .end()
        .end();
      }
    },
    {
      // QUESTION: why isn't this a reference?
      class: 'Long',
      name: 'payerId',
      section: 'transactionInformation',
      order: 45,
      gridColumns: 3,
      storageTransient: true,
      documentation: 'ID of the payer.',
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          dao: X.userDAO,
          objToChoice: function(user) {
            return [user.id, user.toSummary()];
          }
        };
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
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      tableCellFormatter: function(value, obj) {
        this.__context__.currencyDAO.find(obj.sourceCurrency).then(function(c) {
          if ( c ) {
            this.add(c.format(value));
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
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
      factory: function() {
        return this.ctrl.homeDenomination ? this.ctrl.homeDenomination : 'CAD';
      },
      javaFactory: `
        return "CAD";
      `,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.currencyDAO,
          objToChoice: function(unit) {
            return [unit.id, unit.id];
          }
        });
      }
    },
    {
      // FIXME: move to a ViewTransaction used on the client
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.TransactionEntity',
      name: 'payee',
      storageTransient: true,
      section: 'transactionInformation',
      order: 80,
      gridColumns: 3,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: x.data.payee$.map((p) => p ? [[p, p.toSummary()]] : [])
        };
      },
      tableCellFormatter: function(value) {
        this.start()
          .start('p').style({ 'margin-bottom': 0 })
            .add(value ? value.displayName : 'na')
          .end()
        .end();
      }
    },
    {
      class: 'Long',
      name: 'payeeId',
      section: 'transactionInformation',
      order: 85,
      gridColumns: 3,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      storageTransient: true,
      documentation: 'ID of the payee.'
    },
    {
      class: 'UnitValue',
      name: 'destinationAmount',
      label: 'Payee Amount',
      includeInDigest: true,
      documentation: `Amount received in the payee's account (desintation account) in the destination currency.`,
      help: `This is the amount sent to payee's account (destination account).`,
      section: 'transactionInformation',
      order: 90,
      gridColumns: 6,
      view: function(_, X) {
        return {
          class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
          linkAmount$: X.data.amount$,
          linkCurrency$: X.data.sourceCurrency$,
          currency$: X.data.destinationCurrency$,
          linked: true
        };
      },
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        return unitProp.format(val);
      },
      tableCellFormatter: function(value, obj) {
        this.__context__.currencyDAO.find(obj.destinationCurrency).then(function(c) {
          if ( c ) {
            this.add(c.format(value));
          }
        }.bind(this));
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String dstCurrency = ((Transaction)obj).getDestinationCurrency();
        foam.core.Currency currency = (foam.core.Currency) currencyDAO.find(dstCurrency);

        // Outputting two columns: "amount", "Currency"
        outputter.outputValue(currency.formatPrecision(get_(obj)));
        outputter.outputValue(dstCurrency);
      `,
      javaToCSVLabel: `
        // Outputting two columns: "amount", "Currency"
        outputter.outputValue("Destination Amount");
        outputter.outputValue("Destination Currency");
      `,
      validationPredicates: [
        {
          args: ['destinationAmount'],
          predicateFactory: function(e) {
            return e.GTE(net.nanopay.tx.model.Transaction.DESTINATION_AMOUNT, 0);
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
    {
      class: 'String',
      name: 'destinationCurrency',
      label: 'Payee Currency',
      section: 'transactionInformation',
      order: 100,
      gridColumns: 6,
      includeInDigest: true,
      aliases: ['destinationDenomination'],
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      documentation: 'Destination currency.',
      value: 'CAD'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'transactionInformation',
      order: 110,
      gridColumns: 6,
      tableWidth: 190,
      value: 'COMPLETED',
      includeInDigest: true,
      writePermissionRequired: true,
      sheetsOutput: true,
      javaToCSVLabel: `
        // Outputting two columns: "this transaction status" and "Returns childrens status"
        outputter.outputValue("Transaction Status");
        outputter.outputValue("Transaction State");
      `,
      javaToCSV: `
        // Outputting two columns: "this transaction status" and "Returns childrens status"
        outputter.outputValue(get_(obj));
        outputter.outputValue(((Transaction)obj).getState(x));
      `,
      view: function(o, x) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: x.data.statusChoices
        };
      },
      createVisibility: 'HIDDEN',
      readVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      section: 'transactionInformation',
      order: 120,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      view: function(_, x) {
        return foam.u2.Element.create()
          .start()
            .add(x.data.invoiceId)
          .end();
      },
      javaToCSVLabel: 'outputter.outputValue("Payment Id/Invoice Id");',
      includeInDigest: true
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: `The date the transaction was created.`,
      storageTransient: true,
      section: 'transactionInformation',
      order: 150,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      javaToCSVLabel: 'outputter.outputValue("Transaction Request Date");',
      javaGetter: 'return getStatusHistory()[0].getTimeStamp();',
      getter: function() {
         return this.statusHistory[0].timeStamp;
      },
      tableWidth: 172,
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: `The id of the user who created the transaction.`,
      section: 'transactionInformation',
      order: 160,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      },
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: `The id of the agent who created the transaction.`,
      visibility: 'HIDDEN',
      includeInDigest: true
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      section: 'transactionInformation',
      order: 170,
      gridColumns: 6,
      documentation: `The date the transaction was last modified.`,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'transactionInformation',
      order: 180,
      gridColumns: 6,
      documentation: `The id of the user who last modified the transaction.`,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      },
      includeInDigest: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      section: 'transactionInformation',
      order: 180,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      },
      includeInDigest: true
    },
    {
      name: 'lastStatusChange',
      class: 'DateTime',
      includeInDigest: false,
      section: 'transactionInformation',
      order: 182,
      gridColumns:6,
      documentation: 'The date that a transaction changed to its current status',
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      storageTransient: true,
      expression: function(statusHistory) {
        return Array.isArray(statusHistory)
          && statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].timeStamp : null;
      }
    },
    {
      name: 'statusHistory',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.HistoricStatus',
      includeInDigest: false,
      section: 'transactionInformation',
      order: 290,
      documentation: 'Status history of the transaction.',
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      factory: function() {
        var h = [1];
        h[0] = net.nanopay.tx.HistoricStatus.create();
        h[0].status = this.status;
        h[0].timeStamp = new Date();
        return h;
      },
      javaFactory: `
        net.nanopay.tx.HistoricStatus[] h = new net.nanopay.tx.HistoricStatus[1];
        h[0] = new net.nanopay.tx.HistoricStatus();
        h[0].setStatus(getStatus());
        h[0].setTimeStamp(new Date());
        return h;`
    },
    {
      class: 'String',
      name: 'externalId',
      section: 'transactionInformation',
      order: 380,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'externalInvoiceId',
      label: 'External Invoice ID',
      section: 'transactionInformation',
      order: 390,
      gridColumns: 6,
      includeInDigest: true
    },
    {
      class: 'Map',
      name: 'externalData',
      section: 'transactionInformation',
      order: 400
    },
    {
      name: 'lineItems',
      documentation: 'Line items of the transaction',
      section: 'lineItemsInformation',
      order: 10,
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      javaValue: 'new TransactionLineItem[] {}',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      includeInDigest: false,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6,
      storageTransient: true,
      javaFactory: `
        var transactionSpidMap = new java.util.HashMap();
        transactionSpidMap.put(
          Account.class.getName(),
          new foam.core.PropertyInfo[] { Account.OWNER }
        );
        transactionSpidMap.put(
          Transaction.class.getName(),
          new foam.core.PropertyInfo[] {
            // NOTE: Prioritize destinationAccount over sourceAccount route
            // since in a multi-leg plan the intermediary account becomes the
            // the sourceAccount of the second leg. The intermediary account can
            // be owned by nanopay and won't provide the correct spid for the
            // transaction.
            Transaction.DESTINATION_ACCOUNT,
            Transaction.SOURCE_ACCOUNT
          }
        );
        return new ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), transactionSpidMap, this);
      `
    },
    {
      class: 'String',
      name: 'summary',
      section: 'systemInformation',
      order: 40,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of Transactions.
      `,
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
            sourceCurrency,
            destinationCurrency,
            currencyDAO,
            homeDenomination  /* Do not remove b/c the cell needs to re-render if homeDenomination changes */
          ) {
            return Promise.all([
              currencyDAO.find(sourceCurrency),
              currencyDAO.find(destinationCurrency)
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
      tableWidth: 400,
    },
    {
      class: 'DateTime',
      name: 'scheduledTime',
      includeInDigest: false,
      section: 'systemInformation',
      order: 45,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      documentation: `The scheduled date when transaction should be processed.`
    },
    {
      // TODO: DELETE... DEPRECATED
      // REVIEW: processDate and completionDate are Alterna specific?
      class: 'DateTime',
      name: 'processDate',
      section: 'deprecatedInformation',
      storageTransient: true,
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO'
    },
    {
      //TODO: DELETE ... DEPRECATED
      class: 'DateTime',
      name: 'completionDate',
      storageTransient: true,
      section: 'deprecatedInformation',
      createVisibility: 'RO',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      tableWidth: 172
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      includeInDigest: true,
      writePermissionRequired: true,
      hidden: true,
      networkTransient: true
    },
    {
      // can this also be storage transient and just take the first entry in the historicStatus array?
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      networkTransient: true,
      hidden: true,
      includeInDigest: false
    },
    {
      // REVIEW: Remove-  I suspect this specific to payment providers.
      class: 'String',
      name: 'dstAccountError',
      documentation: 'This is used strictly for the synchronizing of dstAccount errors on create.',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'planner',
      documentation: 'A reference to the planner that created this transaction.',
      visibility: 'HIDDEN',
      storageTransient: true,
      networkTransient: true
    },
    {
      name: 'next',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      storageTransient: true,
      networkTransient: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'Long',
      name: 'planCost',
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      // This is used to store what the view mode is - ReadOnly, Create, Update, etc.
      class: 'String',
      name: 'mode',
      visibility: 'HIDDEN',
      includeInDigest: false,
      networkTransient: true
    },
    {
      name: 'balances',
      class: 'FObjectArray',
      of: 'net.nanopay.account.Balance',
      javaFactory: 'return new Balance[0];',
      hidden: true,
      includeInDigest: false
    },
    {
      name: 'isValid',
      class: 'Boolean',
      documentation: 'Whether the transaction has passed capability and planner validation.',
      hidden: true,
      value: false,
      networkTransient: true,
      storageTransient: true
    },
    {
      name: 'transfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      hidden: true,
      includeInDigest: true,
      networkTransient: true
    },
    {
      name: 'reverseTransfers',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      javaFactory: 'return new Transfer[0];',
      includeInDigest: false,
      networkTransient: true,
      hidden: true
    },
    {
      name: 'statusChoices',
      hidden: true,
      factory: function() {
        return ['No status to choose'];
      },
      documentation: 'Returns available statuses for each transaction depending on current status',
      storageTransient: true
    }
  ],

  // REVIEW: move many methods to a Transactions.js support model
  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        if ( !this.id )
          return this.type;

        return this.type + ' ' + this.id.substring(0, Math.min(this.id.length, 8));
      }
    },
    {
      name: 'findCurrency',
      type: 'Promise',
      code: function() {
        return Promise.all([
          this.currencyDAO.find(this.sourceCurrency),
          this.currencyDAO.find(this.destinationCurrency)
        ]).then(([srcCurrency, dstCurrency]) => {
          let output = this.type + ' ';

          if ( this.sourceCurrency === this.destinationCurrency ) {
            output += srcCurrency ? srcCurrency.format(this.amount) : `${this.amount} ${this.sourceCurrency}`;
          } else {
            output += srcCurrency ? srcCurrency.format(this.amount) : `${this.amount} ${this.sourceCurrency}`;
            output += ' → ';
            output += dstCurrency
                        ? dstCurrency.format(this.destinationAmount)
                        : `${this.destinationAmount} ${this.destinationCurrency}`;
          }
          return output;
        });
      }
    },
    {
      name: 'doFolds',
      javaCode: `
        for ( Balance b : getBalances() ) {
          fm.foldForState(b.getAccount(), getCreated(), b.getBalance());
        }
      `
    },
    {
      name: 'limitedClone',
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
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if ( oldTxn == null || oldTxn.getStatus() == TransactionStatus.SCHEDULED ) return this;
        Transaction newTx = (Transaction) oldTxn.fclone();
        newTx.limitedCopyFrom(this);
        return newTx;
      `,
      documentation: 'Updates only the properties that were specified in limitedCopy method'
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      setInvoiceId(other.getInvoiceId());
      setStatus(other.getStatus());
      setExternalData(other.getExternalData());
      setExternalInvoiceId(other.getExternalInvoiceId());
      setLifecycleState(other.getLifecycleState());
      setStatusHistory(other.getStatusHistory());
      `
    },
    {
      name: 'add',
      code: function add(transferArr) {
        this.transfers = this.transfers.concat(transferArr);
      },
      args: [
        {
          name: 'transferArr',
          type: 'net.nanopay.tx.Transfer[]'
        }
      ],
      javaCode: `
        Transfer[] queued = getTransfers();
        synchronized (queued) {
          Transfer[] replacement = Arrays.copyOf(queued, queued.length + transferArr.length);
          System.arraycopy(transferArr, 0, replacement, queued.length, transferArr.length);
          setTransfers(replacement);
        }
      `
    },
    {
      documentation: `return true when status change is such that Transfers should be executed (applied)`,
      name: 'canTransfer',
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
      type: 'Boolean',
      javaCode: `
        // Allow transfer when status=COMPLETED and lifecycleState=ACTIVE
        // - for new transaction and
        // - for old transaction that just transitions to status=COMPLETED or lifecycleState=ACTIVE
        if ( getStatus() == TransactionStatus.COMPLETED
          && getLifecycleState() == LifecycleState.ACTIVE
          && ( oldTxn == null
            || oldTxn.getStatus() != TransactionStatus.COMPLETED
            || oldTxn.getLifecycleState() != LifecycleState.ACTIVE )
        ) {
          return true;
        }
        return false;
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `

      AppConfig appConfig = (AppConfig) x.get("appConfig");
      DAO userDAO = (DAO) x.get("bareUserDAO");
      if ( SafetyUtil.isEmpty(getSourceAccount()) ) {
        throw new ValidationException("sourceAccount must be set");
      }

      if ( SafetyUtil.isEmpty(getDestinationAccount()) ) {
        throw new ValidationException("destinationAccount must be set");
      }

      Account sourceAccount = findSourceAccount(x);
      if ( sourceAccount == null ) {
        throw new ValidationException("Source account not found");
      }
      User sourceOwner = (User) userDAO.find(sourceAccount.getOwner());
      if ( sourceOwner == null ) {
        throw new ValidationException("Payer not found");
      }

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == sourceOwner.getStatus() ) {
        throw new ValidationException("Payer user is disabled");
      }

      Account destinationAccount = findDestinationAccount(x);
      if ( destinationAccount == null ) {
        throw new ValidationException("Destination account not found");
      }
      User destinationOwner = (User) userDAO.find(destinationAccount.getOwner());
      if ( destinationOwner == null ) {
        throw new ValidationException("Payee not found");
      }

      // TODO: Move user checking to user validation service
      if ( AccountStatus.DISABLED == destinationOwner.getStatus() ) {
        throw new ValidationException("Payee user is disabled");
      }

      if ( ! sourceOwner.getEmailVerified() ) {
        throw new AuthorizationException("You must verify email to send money");
      }

      if ( ! (destinationOwner instanceof PersonalContact) && ! destinationOwner.getEmailVerified() ) {
        throw new AuthorizationException("Receiver must verify email to receive money");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getSourceCurrency()) == null && ((DAO)x.get("securitiesDAO")).find(getSourceCurrency()) == null) { //TODO switch to just unitDAO
        throw new ValidationException("Source denomination is not supported");
      }

      if ( ((DAO)x.get("currencyDAO")).find(getDestinationCurrency()) == null && ((DAO)x.get("securitiesDAO")).find(getDestinationCurrency()) == null ) { //TODO switch to just unitDAO
        throw new ValidationException("Destination denomination is not supported");
      }

      validateAmounts(x);
      `
    },
    {
      documentation: 'Returns childrens status.',
      name: 'getState',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'net.nanopay.tx.model.TransactionStatus',
      javaCode: `
        return getStateTxn(x).getStatus();
      `
    },
    {
      name: `validateAmounts`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
        if ( getAmount() < 0) {
          throw new ValidationException("Amount cannot be negative");
        }

        if ( getDestinationAmount() < 0) {
          throw new ValidationException("Destination amount cannot be negative");
        }

        if ( getAmount() == 0 && getDestinationAmount() == 0) {
          throw new ValidationException("Both amount and destination amount cannot be 0");
        }
      `
    },
    {
      documentation: 'Returns 1st child with non complete status',
      name: 'getStateTxn',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED ) {
        return this;
      }
      DAO dao = (DAO) x.get("localTransactionDAO");
      List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, getId())).select(new ArraySink())).getArray();
      for ( Object obj : children ) {
        Transaction child = (Transaction) obj;
        Transaction current = child.getStateTxn(x);
        if ( current.getStatus() != TransactionStatus.COMPLETED ) {
          return current;
        }
      }
      return this;
      `
    },
    {
      name: 'findRoot',
      code: async function findRoot() {
        var txnParent = await this.parent$find;
        if ( txnParent ) {
          while ( txnParent.parent != '' ) {
            txnParent = await txnParent.parent$find;
          }
          return txnParent;
        }
        return this;
      },
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Transaction',
      javaCode: `
        Transaction txnParent = this.findParent(x);
        if ( txnParent != null ) {
          while ( ! SafetyUtil.isEmpty(txnParent.getParent()) ) {
            txnParent = txnParent.findParent(x);
          }
          return txnParent;
        }
        return this;
      `
    },
    {
      name: 'addLineItems',
      code: function addLineItems(forward) {
        if ( Array.isArray(forward) && forward.length > 0 ) {
          this.lineItems = this.copyLineItems(forward, this.lineItems);
        }
      },
      args: [
        { name: 'forward', type: 'net.nanopay.tx.TransactionLineItem[]' }
      ],
      javaCode: `
    if ( forward != null && forward.length > 0 ) {
      setLineItems(copyLineItems(forward, getLineItems()));
    }
`
    },
    {
      name: 'copyLineItems',
      code: function copyLineItems(from, to) {
        if ( from.length > 0 ) {
          to = to.concat(from);
        }
        return to;
      },
      args: [
        { name: 'from', type: 'net.nanopay.tx.TransactionLineItem[]' },
        { name: 'to', type: 'net.nanopay.tx.TransactionLineItem[]' },
      ],
      type: 'net.nanopay.tx.TransactionLineItem[]',
      javaCode: `
      ArrayList<TransactionLineItem> list1 = new ArrayList<>(Arrays.asList(to));
      for ( var item : from ) {
        if ( ! list1.contains(item) ) {
          list1.add(item);
        }
      }
      return list1.toArray(new TransactionLineItem[list1.size()]);
      `
    },
    {
      name: 'getCost',
      code: function getCost() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.FeeLineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].amount;
          }
        }
        return value;
      },
      type: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof FeeLineItem ) {
            value += (Long) ((FeeLineItem) lineItem).getAmount();
          }
        }
        return value;
`
    },
    {
      name: 'getTotalPlanCost',
      type: 'Long',
      javaCode: `
        return getPlanCost() + getCost();
      `
    },
    {
      name: 'getEta',
      code: function getEta() {
        var value = 0;
        for ( var i = 0; i < this.lineItems.length; i++ ) {
          if ( this.ETALineItem.isInstance( this.lineItems[i] ) ) {
            value += this.lineItems[i].eta;
          }
        }
        return value;
      },
      type: 'Long',
      javaCode: `
        TransactionLineItem[] lineItems = getLineItems();
        Long value = 0L;
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          if ( lineItem instanceof ETALineItem ) {
            value += (Long) ((ETALineItem)lineItem).getEta();
          }
        }
        return value;
        `
    },
    {
      name: 'addNext',
      documentation: 'For adding multiple child transactions use CompositeTransaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
      Transaction tx = this;
      if ( tx.getNext() != null && tx.getNext().length >= 1 ) {
         if ( tx.getNext().length > 1) {
           throw new TransactionException("Error, this non-Composite transaction has more then 1 child");
         }
         Transaction [] t = tx.getNext();
         t[0].addNext(txn);
      }
      else {
        txn.setInitialStatus(txn.getStatus());
        txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
        Transaction [] t2 = new Transaction [1];
        t2[0] = txn;
        tx.setNext(t2);
      }
    `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
      // TODO: Move logic in AuthenticatedTransactionDAO here.
    `
  },
  {
    name: 'getOutgoingAccount',
    type: 'String',
    javaCode: `
      return getSourceAccount();
    `
  },
  {
    name: 'getTotal',
    type: 'Long',
    documentation: 'Sum of transfers on this transaction for a given account',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'accountId', type: 'String' }
    ],
    javaCode: `
      Long sum = 0l;
      //Sum transfers that affect account
      for ( Transfer t : getTransfers() )
        if ( SafetyUtil.equals(t.getAccount(), accountId) )
          sum += t.getAmount();
      return sum;
    `
    },
    {
      name: 'calculateErrorCode',
      type: 'Long',
      javaCode: `
      return 0l;
    `
    },
    {
      name: 'findPlanner',
      documentation: 'Find the planner that created this transaction',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'FObject',
      javaCode: `
      //TODO: once plannerDAO is a thing this method can go away as itll be auto generated.
      DAO rulerDAO = (DAO) x.get("ruleDAO");
      return (AbstractTransactionPlanner) rulerDAO.find(getPlanner());
    `,
    },
    {
      name: 'getCurrentStageTransfers',
      documentation: 'Find the transfers that belong to the current stage',
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      Transfer[] tr = getTransfers();
      Long stage = getStage();
      List<Transfer> ltr = new ArrayList<Transfer>();
      for (Transfer t : tr)
        if (SafetyUtil.equals(t.getStage(), stage) )
          ltr.add(t);
      return ltr.toArray(new Transfer[0]);
    `,
    },
    {
      name: 'getStage',
      documentation: 'The current transaction transfer execution stage',
      type: 'Long',
      javaCode: `
      return 0;
    `,
    }
  ]
});
