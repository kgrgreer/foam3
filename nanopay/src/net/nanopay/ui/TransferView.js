foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: "View to Transfer Amounts From Account to Account",

  requires: [
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.ui.CountdownView',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'balance',
    'email',
    'formatCurrency',
    'transactionDAO',
    'user'
  ],

  exports: [
    'countdownView'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' },
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

      ^ .hidden {
        display: none !important;
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

      ^ .net-nanopay-ui-ActionView-goNext {
        margin-left: 40px !important;
        font-size: 12px;
      }

      ^ .net-nanopay-ui-ActionView-goBack {
          min-width: 136px;
          height: 40px;
          font-size: 12px;
      }
    */} })
  ],

  properties: [
    {
      name: 'countdownView',
      factory: function() {
        return this.CountdownView.create();
      }
    }
  ],

  methods: [
    function init() {
      this.title = 'Send Transfer';

      this.views = [
        { parent: 'etransfer', id: 'etransfer-transfer-from',     label: 'Transfer from', view: { class: 'net.nanopay.ui.TransferFrom' } },
        { parent: 'etransfer', id: 'etransfer-transfer-to',       label: 'Transfer to',   view: { class: 'net.nanopay.ui.TransferTo'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-complete', label: 'Successful',    view: { class: 'net.nanopay.ui.transfer.TransferComplete'  } }
      ];

      this.countdownView.hide();
      this.SUPER();
    },

    function initE() {
      this.addClass(this.myClass())
        .start('div').addClass('row')
          .start('div').addClass('positionColumn')
            .start('p').add(this.title || '').addClass('title').end()
            .start({ class: 'net.nanopay.ui.wizard.WizardOverview', titles: this.viewTitles, position$: this.position$ }).addClass('overviewTopMargin').end()
          .end()
          .start('div').addClass('stackColumn')
            .start('div').addClass('topRow')
              .add(this.countdownView)

            .end()
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).addClass('stackView')
            .start('div').addClass('row')
              .start('div').addClass('navigationContainer')
                .start(this.GO_BACK, { label$: this.backLabel$ }).end()
                .start(this.GO_NEXT, { label$: this.nextLabel$ }).end()
              .end()
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function(position, errors) {
        return this.position !== 0 && this.position !== 2;
      },
      code: function(X) {
        if ( this.position === 0 ) {
          X.stack.back();
          return;
        }

        if ( this.position === 1 ) { // Going back on Amount Screen
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();
        }

        if ( this.position === 2 ) {
          X.stack.push({ class: 'net.nanopay.ui.TransferView' });
          return;
        }

        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function(X) {
        var self        = this;
        var transaction = null;

        if ( this.position === 0 ) { // transfer from
          var accountType = this.viewData.type;
          var isBankAccount = accountType.substring(accountType.length - 11) == 'BankAccount';
          var isTrustAccount = accountType == 'TrustAccount';

          if ( self.viewData.fromAmount <= 0 ) {
            this.add(this.NotificationMessage.create({
              message: 'Transfer amount must be greater than 0.',
              type: 'error'
            }));
            return;
          }

          if ( isBankAccount ) {
            // Check if payer has a verified bank account
            self.accountDAO.where(
              self.AND(
                self.EQ(self.BankAccount.ID, self.viewData.payerAccount),
                self.EQ(self.BankAccount.STATUS, self.BankAccountStatus.VERIFIED)))
            .select().then(function(account) {
              if ( account.array.length === 0 ) {
                self.add(self.NotificationMessage.create({
                  message: 'Bank Account should be verified for making this transfer ',
                  type: 'error'
                }));
                return;
              }
              self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
            }).catch(function(err) {
              self.add(self.NotificationMessage.create({
                message: 'Could not continue. Please contact customer support.',
                type: 'error'
              }));
            });
          } else {
            // Check if payer has enough digital cash to make the transfer and show
            // an error message if they don't.
            var fundsInsufficient =
              this.viewData.balance < this.viewData.fromAmount;
            if ( ! isBankAccount && ! isTrustAccount && fundsInsufficient ) {
              this.add(this.NotificationMessage.create({
                message: 'Unable to process payment: insufficient digital cash.',
                type: 'error'
              }));
              return;
            }
            self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
          }
        } else if ( this.position === 1 ) { // transfer to
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();

          transaction = this.Transaction.create({
            sourceCurrency: this.viewData.payerDenomination,
            destinationCurrency: this.viewData.payeeDenomination,
            payerId: this.viewData.payer,
            payeeId: this.viewData.payee,
            amount: this.viewData.fromAmount,
            sourceAccount: this.viewData.payerAccount,
            destinationAccount: this.viewData.payeeAccount
          });

          this.transactionDAO.put(transaction)
            .then(function(result) {
              if ( result ) {
                self.viewData.transaction = result;
              }
            })
            .then(function(response) {
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = 'Make New Transfer';
            })
            .catch(function(err) {
              self.add(self.NotificationMessage.create({
                type: 'error',
                message: 'Unable to process payment: ' + err.message
              }));
            });
        }  else if ( this.position === 2 ) { // Successful        
          this.backLabel = 'Back';
          this.nextLabel = 'Next';
          X.stack.push({ class: 'net.nanopay.ui.TransferView' });
          return;
        } else {
          this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
        }
      }
    }
  ]
});
