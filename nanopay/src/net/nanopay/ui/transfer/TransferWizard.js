foam.CLASS({
  package: 'net.nanopay.ui.transfer',
  name: 'TransferWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for e-transfer',

  requires: [
    'net.nanopay.ui.CountdownView',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.cico.model.TransactionType',
    'net.nanopay.model.BankAccount',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.notification.email.EmailMessage'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'bankAccountDAO',
    'bankAccountVerification',
    'transactionDAO',
    'invoiceDAO',
    'standardCICOTransactionDAO',
    'email',
    'formatCurrency'
  ],

  exports: [
    'countdownView',
    'invoice',
    'invoiceMode',
    'type'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ {
        height: auto !important;
      }

      ^ .overviewTopMargin {
        margin-top: 21px;
      }

      ^ .title {
        margin-top: 15px !important;
      }

      ^ .topRow {
        margin-top: 15px;
        width: 100%;
        height: 40px;
        padding: 0 !important;
        box-sizing: border-box;
        margin-bottom: 20px;
      }

      ^ .net-nanopay-interac-ui-CountdownView {
        display: inline-block;
        line-height: 40px;
      }

      ^ .timerText {
        display: inline-block;
        margin-left: 20px;
        margin-top: 6px;
        opacity: 1 !important;
      }

      ^ .hidden {
        display: none !important;
      }

      ^ .interacImage {
        display: inline-block;
        vertical-align: top;
        width: 90px;
        height: 40px;
        object-fit: contain;
        float: right;
      }

      ^ p {
        margin: 0;
        color: #093649;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        margin-bottom: 8;
      }

      ^ .pDetails {
        opacity: 0.7;
        font-size: 12px;
        line-height: 1.17;
        letter-spacing: 0.2px;
        color: #093649;
      }

      ^ .bold {
        font-weight: bold;
        margin-bottom: 20px;
        letter-spacing: 0.4px;
      }

      ^ .detailsCol {
        display: inline-block;
        vertical-align: top;
        width: 320px;
      }

      ^ .divider {
        display: inline-block;
        vertical-align: top;
        width: 2px;
        height: 520;
        box-sizing: border-box;
        background-color: #a4b3b8;
        opacity: 0.3;
        margin: auto 51px;
      }

      ^ .fromToCol {
        display: inline-block;
        vertical-align: top;
        width: 300px;
      }

      ^ .fromToCard {
        box-sizing: border-box;
        padding: 20px;
        width: 300px;
        border-radius: 2px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 20px;
      }

      ^ .pricingCol {
        display: inline-block;
        vertical-align: top;
        width: 160px;
        box-sizing: border-box;
      }

      ^ .pPricing {
        font-size: 12px;
        margin-bottom: 10px;
      }

      ^ .invoiceDetailContainer {
        width: 100%;
        margin-bottom: 20px;
      }

      ^ .invoiceLabel {
        display: inline-block;
        vertical-align: top;
        box-sizing: border-box;
        width: 100px;
        margin: 0;
        margin-right: 35px;
      }

      ^ .invoiceLabel:first-child {
        margin-bottom: 10px;
      }

      ^ .invoiceDetail {
        display: inline-block;
        vertical-align: top;

        font-size: 12px;
        padding-top: 2px;
        letter-spacing: 0.2px;
        color: #093649;
        margin: 0;
      }

      ^ .invoiceLink {
        display: block;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2px;
        text-align: left;
        color: #59a5d5;
        margin-bottom: 20px;
      }

      ^ .invoiceLink:hover {
        cursor: pointer;
      }

      ^ .net-nanopay-ui-ActionView-goNext {
        font-size: 10px;
      }

      ^ .net-nanopay-ui-ActionView-goBack {
        font-size: 10px;
      }
    */}})
  ],

  messages: [
    { name: 'TimerText', message: 'before exchange rate expires.' }
  ],

  properties: [
    {
      name: 'countdownView',
      factory: function() {
        return this.CountdownView.create();
      }
    },
    'type',
    'invoice',
    'invoiceMode'
  ],

  methods: [
    function init() {
      if(this.type == 'foreign'){ this.title = 'Send e-Transfer'}
      else { this.title = 'Send Transfer' }

      if ( this.invoice ) {
        this.viewData.invoiceNumber = this.invoice.invoiceNumber;
        this.viewData.purchaseOrder = this.invoice.purchaseOrder;
        this.viewData.invoiceFileUrl = this.invoice.invoiceFileUrl;
        this.viewData.fromAmount = this.invoice.amount;
        this.invoiceMode = true;
      } else {
        this.viewData.invoiceNumber = 'N/A';
        this.viewData.purchaseOrder = 'N/A';
        this.invoiceMode = false;
      }

      this.views = [
        { parent: 'etransfer', id: 'etransfer-transfer-details',  label: 'Account & Payee', view: { class: 'net.nanopay.ui.transfer.TransferDetails' } },
        { parent: 'etransfer', id: 'etransfer-transfer-amount',   label: 'Amount',          view: { class: 'net.nanopay.ui.transfer.TransferAmount'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-review',   label: 'Review',          view: { class: 'net.nanopay.ui.transfer.TransferReview'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-complete', label: 'Successful',      view: { class: 'net.nanopay.ui.transfer.TransferComplete'  } }
      ];

      this.countdownView.hide();
      this.SUPER();
    },

    function initE(){
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('row')
          .start('div').addClass('positionColumn')
            .start('p').add(this.title || '').addClass('title').end()
            .start({ class: 'net.nanopay.ui.wizard.WizardOverview', titles: this.viewTitles, position$: this.position$ }).addClass('overviewTopMargin').end()
          .end()
          .start('div').addClass('stackColumn')
            .start('div').addClass('topRow')
              .add(this.countdownView)
              .start('p').addClass('pDetails').addClass('timerText').enableClass('hidden', this.countdownView.isHidden$).add(this.TimerText).end()
              .start().callIf(this.type == 'foreign', function(){
                this.tag({class: 'foam.u2.tag.Image', data: 'images/interac.png'}).addClass('interacImage')
              })
              .end()
            .end()
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).addClass('stackView')
          .end()
        .end()
        .start('div').addClass('row')
          .start('div').addClass('navigationContainer')
            .start(this.GO_BACK, {label$: this.backLabel$}).end()
            .start(this.GO_NEXT, {label$: this.nextLabel$}).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      // isAvailable: function(position, viewData, errors) {
      //   if ( position == 1 && errors && errors[0][1] == 'Rate expired' ) return false;

      //   if ( position == 3 && errors ) return false;

      //   return true;
      // },
      code: function(X) {
        if ( this.position == 0 ) {
          X.stack.back();
          return;
        }

        if ( this.position == 1 ) { // Going back on Amount Screen
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
        }

        if ( this.position == 3 ) {
          X.stack.back();
          return;
        }

        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        return (this.position !== 3);
      },
      code: function(X) {
        var self = this;
        var transaction = null;
        var invoiceId = 0;

        if ( this.position == 2 ) { // On Review Transfer page.
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();
          var rate;
          if( this.type == 'foreign' ){
            rate = this.viewData.rate.toString();
          }
          if ( this.invoiceMode ){
            invoiceId = this.invoice.id;
          }

          var txAmount = Math.round(self.viewData.fromAmount*100);

          // Get payer's bank account
          this.bankAccountDAO.where(
            this.AND(
              this.EQ(this.BankAccount.OWNER, this.user.id),
              this.EQ(this.BankAccount.STATUS, 'Verified')
            )
          ).limit(1).select(function(cashInBankAccount) {
            // Perform a cash-in operation
            var cashInTransaction = self.Transaction.create({
              payeeId: self.user.id,
              amount: txAmount,
              bankAccountId: cashInBankAccount.id,
              type: self.TransactionType.CASHIN
            });

            return self.standardCICOTransactionDAO.put(cashInTransaction);
          }).then(function(response) {
            // NOTE: payerID, payeeID, amount in cents, rate, purpose
            transaction = self.Transaction.create({
              payerId: self.user.id,
              payeeId: self.viewData.payee.id,
              amount: txAmount,
              invoiceId: invoiceId,
              notes: self.viewData.notes
            });

            // Make the transfer
            return self.transactionDAO.put(transaction);
          }).then(function (result) {
            if ( result ) {
              self.viewData.transaction = result;
            }

            return self.bankAccountVerification.addCashout(transaction);
          }).then(function (response) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.backLabel = 'Back to Home';
            self.nextLabel = 'Make New Transfer';
            self.add(self.NotificationMessage.create({ message: "Success!" }));

            if ( self.invoice ) {
              var emailMessage = self.EmailMessage.create({
                to: [ self.viewData.payee.email ]
              });

              self.email.sendEmailFromTemplate(self.user, emailMessage, 'nanopay-paid', {
                fromName: self.user.businessName,
                fromEmail: self.user.email,
                amount: self.formatCurrency(self.invoice.amount),
                number: self.invoice.invoiceNumber
              });
            }
          }).catch(function (err) {
            console.error(err);

            self.add(self.NotificationMessage.create({
              type: 'error',
              message: err.message + '. Unable to process payment...'
            }));

            if ( err ) console.log(err.message);
          });

          return;
        }

        if ( this.position == 3 ) {
          // TODO: Reset params and restart flow
          this.viewData.purpose = '';
          this.viewData.notes = '';
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
          while ( this.position != 0 ) {
            this.subStack.back();
          }
          this.backLabel = 'Back';
          this.nextLabel = 'Next';
          return;
        }
        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    }
  ]
})
