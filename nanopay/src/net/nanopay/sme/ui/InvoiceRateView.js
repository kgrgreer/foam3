foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceRateView',
  extends: 'foam.u2.View',

  documentation: `
    View related to paying or requesting money for an invoice. Display rate, 
    account choice view and terms and condition on cross border payments.
  `,

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.ui.modal.TandCModal',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'appConfig', // TBD location of Ablii terms and conditions
    'currencyDAO',
    'ctrl',
    'user',
    'transactionQuotePlanDAO'
  ],

  css: `
    ^ {
      width: 488px;
      margin: auto;
    }
    ^ .account-container{

    }
    ^ .exchange-amount-container{
      margin-top: 20px;
    }
    ^ .label-value-row{

    }
    ^ .terms-container{

    }
    ^ .inline {
      margin-right: 5px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin: 10px 0px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    {
      class: 'Boolean',
      name: 'isPayable'
    },
    {
      class: 'Boolean',
      name: 'termsAndConditions',
      documentation: `
        Used to determine if user check terms and conditions box.
        Enable proceed to next step if true.  
      `
    },
    {
      name: 'userBankAccounts',
      documentation: 'Provides list of users bank accounts.',
      factory: function() {
        return this.bankAccountDAO.where(
          this.AND(
            this.EQ(this.BankAccount.OWNER, this.user.id),
            this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
          )
        );
      }
    },
    {
      name: 'accountChoice',
      documentation: 'Choice view for displaying and choosing user bank accounts.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.userBankAccounts,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: 'Select Bank Account'
        });
      }
    },
    'quote',
    'sourceCurrency',
    'targetCurrency',
    'rateFetched',
    'viewData'
  ],

  messages: [
    { name: 'TITLE', message: 'Payment details' },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },
    { name: 'CURRENCY_RATE_ADVISORY', message: 'Currency conversion fees will be applied.' },
    { name: 'AMOUNT_DUE_LABEL', message: 'Amount Due' },
    { name: 'EXCHANGE_RATE_LABEL', message: 'Exchange Rate' },
    { name: 'CONVERTED_AMOUNT_LABEL', message: 'Converted Amount' },
    { name: 'TRANSACTION_FEE_LABEL', message: 'Transaction Fees' },
    { name: 'AMOUNT_PAID_LABEL', message: 'Amount Paid' },
    { name: 'CROSS_BORDER_PAYMENT_LABEL', message: 'Cross-border Payment' },
    { name: 'TERMS_AGREEMENT_BEFORE_LINK', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LINK', message: 'Terms and Conditions' },
    { name: 'TERMS_AGREEMENT_AFTER_LINK', message: 'for cross-border payments' },
    { name: 'TO', message: ' to ' }
  ],

  methods: [
    function initE() {
      var self = this;

      this.accountChoice$.sub(this.fetchRates);

      this
        .start().addClass(this.myClass())
          .start('h2')
            .add(this.TITLE)
          .end()
          /** Account choice view with label, choice and advisory note. **/
          .start().addClass('account-container')
            .start()
              .add( this.isPayable ? this.ACCOUNT_WITHDRAW_LABEL : this.ACCOUNT_DEPOSIT_LABEL )
            .end()
            .startContext({ data: this })
            .start()
              .add(this.ACCOUNT_CHOICE)
            .end()
            .endContext()
            .start()
             .add( this.isPayable ? this.CURRENCY_RATE_ADVISORY : null )
            .end()
          .end()
          /** Exchange rate details **/
          .start().addClass('exchange-amount-container').show(this.isPayable$)
            .start().addClass('label-value-row')
              .start()
                .add(this.AMOUNT_DUE_LABEL)
              .end()
              .start().addClass('float-right')
                .add(
                  this.quote$.map(function(quote) {
                    if ( quote ) return self.invoice.amount + ' ' + self.invoice.destinationCurrency;
                  })
                )
              .end()
            .end()
            .start().addClass('label-value-row')
              .start()
                .add(this.EXCHANGE_RATE_LABEL)
              .end()
              .start().addClass('float-right').show(this.rateFetched$)
                .add(
                  this.quote$.dot('sourceCurrency').map(function(curr) {
                    if ( curr ) return 1;
                  }),
                  ' ',
                  this.quote$.dot('sourceCurrency'),
                  this.quote$.dot('fxRate').map(function(rate) {
                    if ( rate ) return self.TO;
                  }),
                  this.quote$.dot('fxRate'),
                  ' ',
                  this.quote$.dot('destinationCurrency')
                )
              .end()
            .end()
            .start().addClass('label-value-row')
              .start()
                .add(this.CONVERTED_AMOUNT_LABEL)
              .end()
              .start().addClass('float-right')
                .add(
                  this.quote$.dot('destinationAmount'),
                  ' ',
                  this.quote$.dot('sourceCurrency')
                )
              .end()
            .end()
            .start().addClass()
              .start()
                .add(this.TRANSACTION_FEE_LABEL)
              .end()
              .start().addClass('float-right')
                // Fetches all transaction fees and displays them to the user.
                .add(this.quote$.dot('transfers').map(function(t) {
                  if ( ! t ) return;
                  for ( i = 0; t.length; i++ ) {
                    if ( t[i] && t[i].description == 'FX Broker Fee' && t[i].amount < 0 ) {
                      return self.E().start().add(-t[i].amount, ' ', self.quote.sourceCurrency).end();
                    }
                  }
                }))
              .end()
            .end()
            .start().addClass('label-value-row')
              .start()
                .add(this.AMOUNT_PAID_LABEL)
              .end()
              .start().addClass('float-right')
                .add(
                  this.quote$.dot('amount'),
                  ' ',
                  this.quote$.dot('sourceCurrency')
                )
              .end()
            .end()
          .end()
          /** Terms and condition check  **/
          .start().addClass('terms-container')
            .start().addClass('wizardBoldLabel')
              .add(this.CROSS_BORDER_PAYMENT_LABEL)
            .end()
            .start()
            .tag({ class: 'foam.u2.CheckBox', data$: this.termsAndConditions$ })
            .start().addClass('inline').add(this.TERMS_AGREEMENT_BEFORE_LINK).end()
            .start().addClass('link').addClass('inline')
              .add(this.TERMS_AGREEMENT_LINK)
              .on('click', () => {
                self.add(self.Popup.create().tag({
                  class: self.appConfig.termsAndCondLink,
                  exportData$: self.appConfig.version$
                }));
              })
            .end()
            .start().addClass('inline').add(this.TERMS_AGREEMENT_AFTER_LINK).end()
          .end()
        .end();
    }
  ],

  listeners: [
    async function fetchRates() {
      // Fetch chosen bank account.
      var chosenBankAccount = await this.userBankAccounts.find(this.accountChoice);

      // Create transaction to fetchRates.
      transaction = this.Transaction.create({
        sourceAccount: chosenBankAccount.id,
        sourceCurrency: chosenBankAccount.denomination,
        destinationCurrency: this.invoice.destinationCurrency,
        payerId: this.invoice.payerId,
        payeeId: this.invoice.payeeId,
        amount: this.invoice.amount,
      });

      // Using the created transaction, put to quotePlanDAO and retrieve quote for transaction.
      var quote = await this.transactionQuotePlanDAO.put(
        this.TransactionQuote.create({
          requestTransaction: transaction
        })
      );

      // Fetch best plan from transaction quote plan.
      this.quote = quote ?
          quote.plan ? quote.plan.transaction :
          null : null;

      // Get correlated currencies used in exchange.
      if ( this.quote.sourceCurrency && this.quote.targetCurrency ) {
        this.sourceCurrency = await this.currencyDAO.find(this.quote.sourceCurrency);
        this.targetCurrency = await this.currencyDAO.find(this.quote.targetCurrency);
      }
    }
  ]
});
