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
  package: 'net.nanopay.support',
  name: 'SupportTransaction',

  documentation: `This model represents a transaction from an external support perspective.`,

  implements: [
    'foam.mlang.Expressions'
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

  requires: [
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.HistoricStatus',
  ],

  javaImports: [
    'java.util.Date'
  ],

  tableColumns :[
    'id',
    'amount',
    'externalId',
    'chainSummary.summary',
    'chainSummary.status',
    'chainSummary.errorCode'
  ],

  messages: [
    { name: 'DESCRIPTION', message: 'Transaction Summary' }
  ],

  sections: [
    {
      name: 'transactionInformation'
    },
    {
      name: 'transactionLineItems'
    },
    {
      name: 'referenceInformation',
      title: 'Transaction Metadata'
    }
  ],

  properties: [
    net.nanopay.tx.model.Transaction.ID.clone().copyFrom({
      label: 'Transaction ID',
      section: 'transactionInformation',
      order: 1,
      gridColumns: 12
    }),
    net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT.clone().copyFrom({
      label: 'Payer Account',
      gridColumns:4,
      help: '',
      targetDAOKey: 'supportAccountDAO',
      view: {
        class: 'foam.u2.view.ReadReferenceView'
      },
      section: 'transactionInformation',
      order: 2
    }),
    net.nanopay.tx.model.Transaction.AMOUNT.clone().copyFrom({
      label: 'Payer Amount',
      gridColumns:4,
      help: 'Amount sent by payer in the payer currency.',
      validationPredicates: [],
      section: 'transactionInformation',
      order: 3,
      view: function(_, X) {
        if ( X.data.amount > 0 || ( X.data.amount == 0 && X.data.destinationAmount == 0 ) ) {
          return {
            class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
            linkCurrency$: X.data.destinationCurrency$,
            currency$: X.data.sourceCurrency$,
            linkAmount$: X.data.destinationAmount$
          }
        }
        return {
          class: 'foam.u2.view.LiteralValueView',
          value: '--'
        }
      }
    }),
    net.nanopay.tx.model.Transaction.SOURCE_CURRENCY.clone().copyFrom({
      label: 'Payer Currency',
      gridColumns:4,
      section: 'transactionInformation',
      order: 4
    }),
    net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT.clone().copyFrom({
      label: 'Payee Account',
      gridColumns:4,
      help: '',
      targetDAOKey: 'supportAccountDAO',
      view: {
        class: 'foam.u2.view.ReadReferenceView'
      },
      section: 'transactionInformation',
      order: 5
    }),
    net.nanopay.tx.model.Transaction.DESTINATION_AMOUNT.clone().copyFrom({
      label: 'Payee Amount',
      gridColumns:4,
      help: 'Amount requested by payee in the payee currency.',
      validationPredicates: [],
      section: 'transactionInformation',
      order: 6,
      view: function(_, X) {
        if ( X.data.destinationAmount > 0 ) {
          return {
            class: 'net.nanopay.tx.ui.UnitFormatDisplayView',
            linkCurrency$: X.data.destinationCurrency$,
            currency$: X.data.sourceCurrency$,
            linkAmount$: X.data.destinationAmount$
          }
        }
        return {
          class: 'foam.u2.view.LiteralValueView',
          value: '--'
        }
      }
    }),
    net.nanopay.tx.model.Transaction.DESTINATION_CURRENCY.clone().copyFrom({
      label: 'Payee Currency',
      gridColumns:4,
      section: 'transactionInformation',
      order: 7
    }),
    net.nanopay.tx.model.Transaction.CREATED.clone().copyFrom({
      gridColumns:4,
      section: 'transactionInformation',
      order: 8
    }),
    net.nanopay.tx.model.Transaction.STATUS_HISTORY.clone().copyFrom({
      hidden: true
    }),
    net.nanopay.tx.model.Transaction.LAST_MODIFIED.clone().copyFrom({
      gridColumns:6,
      section: 'transactionInformation',
      order: 9
    }),
    net.nanopay.tx.model.Transaction.CREATED_BY.clone().copyFrom({
      targetDAOKey: 'supportUserDAO',
      gridColumns: 4,
      section: 'transactionInformation',
      order: 10
    }),
    net.nanopay.tx.model.Transaction.LAST_MODIFIED_BY.clone().copyFrom({
      gridColumns:6,
      section: 'transactionInformation',
      order: 11
    }),
    net.nanopay.tx.model.Transaction.EXTERNAL_INVOICE_ID.clone().copyFrom({
      visibility: 'RO',
      gridColumns: 4,
      section: 'transactionInformation',
      order: 12
    }),
    net.nanopay.tx.model.Transaction.EXTERNAL_ID.clone().copyFrom({
      visibility: 'RO',
      gridColumns: 4,
      section: 'transactionInformation',
      order: 13
    }),
    net.nanopay.tx.model.Transaction.STATUS.clone().copyFrom({
      label: 'Submission Status',
      gridColumns:4,
      section: 'transactionInformation',
      order: 14,
      view: { class: 'foam.u2.view.ReadOnlyEnumView' }
    }),
    net.nanopay.tx.model.Transaction.LIFECYCLE_STATE.clone().copyFrom({
      hidden: true
    }),
    net.nanopay.tx.SummaryTransaction.CHAIN_SUMMARY.clone().copyFrom({
      section: 'transactionInformation',
      order: 15
    }),
    net.nanopay.tx.model.Transaction.DST_ACCOUNT_ERROR.clone(),
    net.nanopay.tx.model.Transaction.LINE_ITEMS.clone().copyFrom({
      section: 'transactionLineItems'
    }),
    net.nanopay.tx.model.Transaction.EXTERNAL_DATA.clone().copyFrom({
      section: 'referenceInformation'
    })
  ],

  methods: [
    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});
