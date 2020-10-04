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
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceRateView',
  extends: 'foam.u2.View',

  documentation: `
    View related to paying or requesting money for an invoice. Display rate,
    account choice view on cross border payments.
    The view is capable of going into a read only state which is toggeable by the isReadOnly property.
    Pass transaction quote as property (quote) and bank account as (chosenBankAccount)
    to populate values on the views in read only. The view handles both payable and receivables
    to allow users to choose a bank account for paying invoices, using the isPayable view property.
  `,

  requires: [
    'foam.log.LogLevel',
    'foam.u2.ControllerMode',
    'foam.u2.dialog.Popup',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.fx.client.ClientFXService',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.FXService',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.TransactionQuote',
    'foam.u2.LoadingSpinner',
    'net.nanopay.ui.modal.TandCModal',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.SummaryTransactionLineItem',
    'net.nanopay.tx.ExpirySummaryTransactionLineItem'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'appConfig',
    'auth',
    'ctrl',
    'currencyDAO',
    'fxService',
    'group',
    'invoice',
    'invoiceDAO',
    'isLoading',
    'notify',
    'requestTxn',
    'transactionPlannerDAO',
    'subject',
    'viewData',
    'wizard',
    'updateInvoiceDetails',
    'forceUpdate',
    'txnQuote'
  ],

  exports: [
    'quote'
  ],

  css: `
    ^ .inline {
      margin-right: 5px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin: 10px 0px;
    }
    ^ .exchange-amount-container{
      margin-top: 15px;
    }
    ^ .wizardBoldLabel {
      margin-bottom: 15px;
    }
    ^ .account-container {
      margin-top: 40px;
    }
    ^ .form-label {
      margin-bottom: 5px;
      font-weight: 500;
    }
    ^ .amount-container {
      margin-top: 20px;
    }
    ^ .foam-u2-LoadingSpinner img{
      width: 35px;
    }
    ^ .foam-u2-LoadingSpinner {
      width: 65px;
      position: relative;
      margin: auto;
      margin-bottom: 10px;
    }
    ^ .rate-msg-container {
      width: 110px;
      margin: auto;
    }
    ^ .loading-spinner-container {
      margin: 40px 0px;
    }
    ^label-value-row {
      margin-bottom: 5px;
    }
    ^large-margin-row {
      margin-bottom: 30px;
    }
    ^exchange-rate-text {
      color: #8e9090
    }
    ^ .fees {
      margin-top: 30px;
    }
    .requote-Spinner {
      text-align: center;
    }
    .requote-Spinner .foam-u2-LoadingSpinner img {
      width: 100px;
    }
    .foam-u2-detail-SectionedDetailView-card-container .foam-u2-borders-CardBorder {
      border-radius: 0px;
      box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0);
      border: solid 0px;
      background-color: #F4F7FA;
    }
    .foam-u2-detail-SectionedDetailView .inner-card {
      margin-left: -15px;
    }
    .additional-info-title {
      margin-top: 30px;
      margin-bottom: -10px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: 'Determines if invoice is a payable.',
      factory: function() {
        return this.invoice.payerId === this.subject.user.id;
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isReadOnly',
      documentation: 'Used to make view read only.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'quote',
      documentation: `
        Stores the fetched transaction quote from transactionPlannerDAO.
        Pass a transaction quote as (quote) into view if setting isReadOnly.
        (This will populate values within the view)
      `,
      postSet: function(_, nu) {
        this.viewData.quote = nu;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'sourceCurrency',
      documentation: 'Stores the source currency for the exchange.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'chosenBankAccount',
      factory: function() {
        if ( this.viewData.bankAccount ) return this.viewData.bankAccount;
        return null;
      },
      documentation: `
        Stores the chosen bank account from the accountSelectionView.
        Pass a bankAccount as (chosenBankAccount) into view if setting isReadOnly.
        (This will populate values within the view)
      `
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    },
    {
      name: 'isFx',
      expression: function(chosenBankAccount, invoice$destinationCurrency) {
        return chosenBankAccount != null &&
          ! (invoice$destinationCurrency == chosenBankAccount.denomination && chosenBankAccount.denomination === 'CAD');
      }
    },
    {
      name: 'showExchangeRateSection',
      expression: function(isPayable, isFx, loadingSpinner$isHidden) {
        return isPayable && loadingSpinner$isHidden && isFx;
      }
    },
    {
      name: 'isEmployee',
      expression: function(group) {
        return group.id.includes('.employee');
      }
    },
    {
      name: 'exchangeRateNotice',
      expression: function(isEmployee) {
        return isEmployee ? this.AFEX_RATE_NOTICE + this.NOTICE_WARNING : this.AFEX_RATE_NOTICE;
      }
    },
    {
      name: 'isSameCurrency',
      expression: function(invoice$destinationCurrency, chosenBankAccount) {
        return chosenBankAccount && invoice$destinationCurrency == chosenBankAccount.denomination;
      }
    },
    {
      name: 'reQuoteSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'REVIEW_TITLE', message: 'Review this payment' },
    { name: 'REVIEW_RECEIVABLE_TITLE', message: 'Review this receivable' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction fee of ' },
    { name: 'TRANSACTION_FEE_LABEL_2', message: ' will be charged at the end of the monthly billing cycle.' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount To Be Paid' },
    { name: 'AMOUNT_PAID_TO_LABEL', message: 'Amount Paid To You' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'FETCHING_RATES', message: 'Fetching Rates...' },
    { name: 'LOADING', message: 'Getting quote...' },
    { name: 'TO', message: ' to ' },
    { name: 'ACCOUNT_FIND_ERROR', message: 'Error: Could not find account.' },
    { name: 'CURRENCY_FIND_ERROR', message: 'Error: Could not find currency.' },
    { name: 'RATE_FETCH_FAILURE', message: 'Error fetching rates: ' },
    { name: 'NOTICE_TITLE', message: '*NOTICE: EXCHANGE RATE SUBJECT TO CHANGE.' },
    { name: 'NOTICE_WARNING', message: 'The final exchange rate and resulting amount to be paid will be displayed to the approver.' },
    { name: 'AFEX_RATE_NOTICE', message: 'Rates provided are indicative until the payment is submitted. The rate displayed is held for 30 seconds at a time.' },
    { name: 'UNABLE_TO_PAY_TITLE', message: '*NOTICE: CANNOT PAY TO THIS CURRENCY.' },
    { name: 'CANNOT_PAY_TO_CURRENCY', message: 'Sorry, you cannot pay to this currency. You require enabling FX on our platform to complete the payment.' },
    { name: 'ADDITIONAL_INFORMATION', message: 'Additional information' }

  ],

  methods: [
    async function init() {
      this.loadingSpinner.hide();

      /** Fetch the rates because we need to make sure that the quote and
       * chosen account are available when rendering in read-only
       * mode in the approval flow.
       * And fetch the rate when we go back from 3rd to 2nd step
       * for send payment flow.
       */

      if ( this.wizard.isApproving ||
        ( this.invoice.account !== 0 && ! this.isReadOnly) ) {
        this.fetchRates();
      } else {
        this.fetchBankAccount();
      }

      if ( this.chosenBankAccount && ! this.sourceCurrency ) {
        this.setSourceCurrency();
      }
    },
    function initE() {
      let self = this;
      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.currencyDAO.find(this.invoice.destinationCurrency)
          .then((currency) => {
          this.formattedAmount = currency.format(this.invoice.amount);
        });
      }

      this
        .start()
          .show( this.slot(function(isLoading) {
            return ! isLoading;
          }))
          .addClass(this.myClass())
          .start('h2')
            .add(! this.isReadOnly ? this.TITLE :
              this.isPayable ? this.REVIEW_TITLE :
              this.REVIEW_RECEIVABLE_TITLE)
          .end()
          .start().addClass(this.myClass('large-margin-row'))
            .start().addClass('inline').addClass('body-copy')
              .add(this.AMOUNT_DUE_LABEL)
            .end()
            .start().addClass('float-right').addClass('body-copy')
              .add(this.formattedAmount$)
            .end()
          .end()

          /** Show chosen bank account from previous step. **/
          .start()
            .addClass(this.myClass('large-margin-row'))
            .show(this.isReadOnly)
            .start().addClass('inline')
              .add( this.isPayable ?
                this.ACCOUNT_WITHDRAW_LABEL :
                this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .start().addClass('float-right')
              .add(this.chosenBankAccount$.map((bankAccount) => {
                if ( ! bankAccount ) return;
                var accountNumber = bankAccount.accountNumber;
                return bankAccount.name + ' ****'
                  + accountNumber.substr(accountNumber.length - 5)
                  + ' - '
                  + bankAccount.denomination;
              }))
            .end()
          .end()

          /** Loading spinner. **/
          .start().addClass('loading-spinner-container').hide(this.isReadOnly)
            .start().add(this.loadingSpinner).end()
            .start()
              .hide(this.loadingSpinner.isHidden$)
              .addClass('rate-msg-container')
              .add(this.slot(function( isSameCurrency ) {
                return isSameCurrency ? ' ' : this.FETCHING_RATES;
              }))
            .end()
          .end()

        /** Exchange rate details **/
        .add(this.slot(function(showExchangeRateSection, updateInvoiceDetails) {
          if ( this.forceUpdate ) {
            this.quote = updateInvoiceDetails;
            this.forceUpdate = false;
          }
          return ! showExchangeRateSection ? null :
            this.E()
              .start().show(this.slot(function(showExchangeRateSection, sourceCurrency, invoice$destinationCurrency ) {
                if ( sourceCurrency == null ) {
                  return false;
                }
                return showExchangeRateSection && (! (sourceCurrency.id === 'USD' && invoice$destinationCurrency === 'USD') );
              }))
                .start().addClass('exchange-amount-container')
                  .start()
                    .addClass(this.myClass('label-value-row'))
                    .start()
                      .addClass('inline')
                      .add(this.CONVERTED_AMOUNT_LABEL)
                    .end()
                    .start()
                      .addClass('float-right')
                      .add(this.slot(function(sourceCurrency, quote) {
                        if ( sourceCurrency && quote && quote.amount ) {
                          return sourceCurrency.format(quote.amount);
                        }
                        return '(-)';
                      }),
                        this.exchangeRateNotice$.map((value) => value ? '*' : '')
                      )
                    .end()
                  .end()
                .end()
              .end();
          }))
          .start().show(this.slot(function(quote) {
            if ( quote == null ) {
              return false;
            }
            return quote.getCost() == 0 ? false : true;
          }))
            .start()
              .addClass('inline')
              .addClass('fees')
              .add(this.TRANSACTION_FEE_LABEL)
              .add(
                this.slot( function(quote, sourceCurrency) {
                  if ( ! sourceCurrency || ! quote ) return;
                  return quote.getCost() ?
                    sourceCurrency.format(quote.getCost()) + this.TRANSACTION_FEE_LABEL_2:
                    sourceCurrency.format(0) + this.TRANSACTION_FEE_LABEL_2;
                })
              )
            .end()
          .end()
        .end()
        .start()
          .show(this.isLoading$)
          .addClass('requote-Spinner')
          .add(this.reQuoteSpinner)
        .end()
        .startContext({ controllerMode: this.isReadOnly ? this.ControllerMode.VIEW : this.ControllerMode.CREATE })
          .start()
            .show(this.slot(function(quote, isLoading, txnQuote) {
              if ( isLoading ) return false;
              if ( ! quote ) return;
              if ( txnQuote.showAllLineItems ) return true;
              for ( i=0; i < quote.lineItems.length; i++ ) {
                if ( quote.lineItems[i].requiresUserInput ) {
                  return true;
                }
              }
              return false;
            }))
            .start('h2').addClass('additional-info-title')
              .add(this.ADDITIONAL_INFORMATION)
            .end()
            .start()
              .add(
                this.slot( function(quote, txnQuote) {
                  if ( ! quote ) return;
                  let e = this.E();

                  // display requiresUserInput lineItems first
                  for ( i=0; i < quote.lineItems.length; i++ ) {
                    if ( quote.lineItems[i].requiresUserInput ) {
                      e.add(quote.lineItems[i]);
                    }
                  }

                  for ( i=0; i < quote.lineItems.length; i++ ) {
                    if ( ! quote.lineItems[i].requiresUserInput
                      && (txnQuote.showAllLineItems || this.SummaryTransactionLineItem.isInstance(quote.lineItems[i]))
                      && ! this.PADTypeLineItem.isInstance(quote.lineItems[i])
                      && ! this.ExpirySummaryTransactionLineItem.isInstance(quote.lineItems[i]) ) {
                      e.start({
                        class: 'net.nanopay.tx.LineItemCitationView',
                        data: quote.lineItems[i]
                      });
                    }
                  }

                  return e;
                })
              )
            .end()
          .end()
        .endContext()

        /** summaryTransaction area **/
        .start()
          .add(
            this.slot( function(quote) {
              if ( ! quote ) return;
                return this.E().start({
                  class: 'net.nanopay.tx.SummaryTransactionCitationView',
                  data: quote
                })
            })
          )
        .end()

        .start().show(this.slot(function(isFx, sourceCurrency, invoice$destinationCurrency) {
          if ( sourceCurrency == null ) {
            return false;
          }
          return isFx && (! (sourceCurrency.id === 'USD' && invoice$destinationCurrency === 'USD') ) && ! (invoice$destinationCurrency === 'INR');
        }))
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.exchangeRateNotice, title: this.NOTICE_TITLE })
        .end();
    },

    async function getQuote() {
        this.requestTxn.sourceAccount = this.invoice.account;
        this.requestTxn.destinationAccount = this.invoice.destinationAccount;
        this.requestTxn.sourceCurrency = this.invoice.sourceCurrency;
        this.requestTxn.destinationCurrency = this.invoice.destinationCurrency;
        this.requestTxn.payerId = this.invoice.payerId;
        this.requestTxn.payeeId = this.invoice.payeeId;
        this.requestTxn.destinationAmount = this.invoice.amount;
        if ( ! this.isFx ) {
          this.requestTxn.amount = this.invoice.amount;
        }
        this.requestTxn.lineItems = [];

      var quote = await this.transactionPlannerDAO.put(
        this.TransactionQuote.create({
          requestTransaction: this.requestTxn
        })
      );
      this.txnQuote = quote;
      return quote.plan;
    }
  ],

  listeners: [
    async function fetchRates() {
      this.loadingSpinner.show();

      try {
        await this.fetchBankAccount();
      } catch (err) {
        this.notify(this.ACCOUNT_FIND_ERROR, '', this.LogLevel.ERROR, true);
        console.error('@InvoiceRateView.js (Fetch Bank Account)' + (err ? err.message : ''));
      }

      try {
        this.viewData.isDomestic = ! this.isFx;
        var currencyCheck = `currency.read.${this.invoice.destinationCurrency}`;
        if ( ! await this.auth.check(null, currencyCheck) ) {
          this.notify(this.CANNOT_PAY_TO_CURRENCY, '', this.LogLevel.ERROR, true);
          this.showExchangeRateSection = false;
          this.loadingSpinner.hide();
          return;
        }
        this.quote = await this.getQuote();
        this.viewData.quote = this.quote;
      } catch (error) {
        this.notify(this.RATE_FETCH_FAILURE, '', this.LogLevel.ERROR, true);
        console.error('@InvoiceRateView.js (Fetch Quote)' + (error ? error.message : ''));
      }

      this.loadingSpinner.hide();
    },

    async function fetchBankAccount() {
      // If the user selects the placeholder option in the account dropdown,
      // clear the data.

      var accountId = this.isPayable
        ? this.invoice.account
        : this.invoice.destinationAccount;
      if ( ! accountId && ! this.isReadOnly ) {
        this.viewData.bankAccount = null;
        // Clean the default account choice view
        if ( this.isPayable ) {
          this.quote = null;
          this.viewData.quote = null;
        }
        this.loadingSpinner.hide();
        return;
      }

      // Fetch chosen bank account.
      try {
        var accountId = this.isPayable
          ? this.invoice.account
          : this.invoice.destinationAccount;
        this.chosenBankAccount = await this.subject.user.accounts.find(accountId);
        this.viewData.bankAccount = this.chosenBankAccount;
      } catch (error) {
        this.notify(this.ACCOUNT_FIND_ERROR, '', this.LogLevel.ERROR, true);
        console.error('@InvoiceRateView.js (Fetch payer accounts)' + (error ? error.message : ''));
      }

      if ( ! this.isPayable ) {
        this.loadingSpinner.hide();
        return;
      }

      // Set Source Currency
      this.setSourceCurrency();

      // Update fields on Invoice, based on User choice
      this.invoice.sourceCurrency = this.chosenBankAccount.denomination;
    },

    async function setSourceCurrency() {
      try {
        // get currency for the selected account
        if ( this.chosenBankAccount.denomination ) {
          this.sourceCurrency = await this.currencyDAO
            .find(this.chosenBankAccount.denomination);
        }
      } catch (error) {
        this.notify(this.CURRENCY_FIND_ERROR, '', this.LogLevel.ERROR, true);
        console.error('@InvoiceRateView.js (Set source currency)' + (error ? error.message : ''));
        this.loadingSpinner.hide();
        return;
      }
    },
  ],
});


