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
  package: 'net.nanopay.ui.transfer',
  name: 'TransferWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for e-transfer',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.notification.email.EmailMessage',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.ui.CountdownView',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.TransactionQuote'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'currentAccount',
    'accountDAO',
    'balance',
    'email',
    'formatCurrency',
    'invoiceDAO',
    'notify',
    'transactionDAO',
    'user',
    'accountDAO as bankAccountDAO',
    'transactionPlannerDAO'
  ],

  exports: [
    'countdownView',
    'invoice',
    'invoiceMode',
    'type',
    'quote',
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css: `
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
      color: /*%BLACK%*/ #1e1f21;
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
      color: /*%BLACK%*/ #1e1f21;
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
      color: /*%BLACK%*/ #1e1f21;
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

    ^ .foam-u2-ActionView-goNext {
      margin-left: 40px !important;
      font-size: 12px;
    }

    ^ .foam-u2-ActionView-goBack {
        min-width: 136px;
        height: 40px;
        font-size: 12px;
    }
  `,

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
    'invoiceMode',
    'quote'
  ],

  methods: [
    function init() {
      this.title = this.type === 'foreign' ?
        'Send e-Transfer' :
        'Send Transfer';

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
        { parent: 'etransfer', id: 'etransfer-transfer-review',   label: 'Review',          view: { class: 'net.nanopay.ui.transfer.TransferReview'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-planSelectionWizard',  label: 'Choose a Plan', view: { class: 'net.nanopay.ui.transfer.PlanSelectionWizard' } },
        { parent: 'etransfer', id: 'etransfer-transfer-complete', label: 'Successful',      view: { class: 'net.nanopay.ui.transfer.TransferComplete'  } }
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
              .start('p').addClass('pDetails').addClass('timerText').enableClass('hidden', this.countdownView.isHidden$).add(this.TimerText).end()
              .start().callIf(this.type === 'foreign', function() {
                this.tag({
                  class: 'foam.u2.tag.Image',
                  data: 'images/interac.png'
                }).addClass('interacImage');
              })
              .end()
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
      // isAvailable: function(position, viewData, errors) {
      //   if ( position == 1 && errors && errors[0][1] == 'Rate expired' ) return false;

      //   if ( position == 3 && errors ) return false;

      //   return true;
      // },
      code: function(X) {
        if ( this.position === 0 ) {
          X.stack.back();
          return;
        }

        if ( this.position === 1 ) { // Going back on Amount Screen
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
        }

        if ( this.position === 3 ) {
          X.stack.push({ class: 'net.nanopay.invoice.ui.ExpensesView' });
          return;
        }

        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        return this.position !== 3;
      },
      code: function(X) {
        var self        = this;
        var transaction = null;
        var invoiceId   = 0;

        if ( this.position === 0 ) { // Account & Payee
          if ( this.viewData.accountCheck ) {
            // Check if user has a verified bank account
            self.bankAccountDAO.where(
              self.AND(
                self.EQ(
                  self.BankAccount.STATUS, self.BankAccountStatus.VERIFIED
                ),
                self.EQ(
                  self.BankAccount.OWNER, self.user
                )
              )
            ).limit(1).select().then(function(account) {
              if ( account.array.length === 0 ) {
                self.notify('Bank account should be verified for paying this invoice.', '', self.LogLevel.ERROR, true);
                return;
              }
              self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
            }).catch(function(err) {
              self.notify('Could not continue. Please contact customer support.', '', self.LogLevel.ERROR, true);
            });
          } else {
            // Check if user has enough digital cash to make the transfer and show
            // an error message if they don't.
            var fundsInsufficient =
              this.balance.balance < self.viewData.fromAmount;
            if ( ! self.viewData.accountCheck && fundsInsufficient ) {
              this.notify('Unable to process payment: insufficient digital cash.', '', this.LogLevel.ERROR, true);
            }
            self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
          }
        } else if ( this.position === 1 ) { // Review
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();

          if ( this.invoiceMode ) {
            invoiceId = this.invoice.id;
          }

          transaction = self.Transaction.create({
            sourceCurrency: this.currentAccount.denomination,
            destinationCurrency: this.invoice.destinationCurrency,
            payeeId: this.viewData.payee.id,
            amount: self.viewData.fromAmount,
            invoiceId: invoiceId,
            notes: self.viewData.notes
          });

          if ( this.viewData.digitalCash === undefined ) {
            transaction.sourceAccount = this.currentAccount.id;
          } else if ( ! this.viewData.digitalCash ) {
            transaction.sourceAccount = this.viewData.account;
          }

          this.quote = self.transactionPlannerDAO.put(
            self.TransactionQuote.create({
              requestTransaction: transaction
            })
          );

          self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
        } else if ( this.position === 2 ) { // Choose a Plan
          // Make the transfer
          self.transactionDAO.put(self.viewData.transaction)
            .then(function(result) {
              if ( result ) {
                self.viewData.transaction = result;
              }
            })
            .then(function(response) {
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.backLabel = 'Back to Home';
              self.nextLabel = 'Make New Transfer';
            })
            .catch(function(err) {
              self.notify('Unable to process payment: ' + err.message, '', self.LogLevel.ERROR, true);
            });
        } else if ( this.position === 3 ) { // Successful
          // TODO: Reset params and restart flow
          this.viewData.purpose = '';
          this.viewData.notes = '';
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
          while ( this.position !== 0 ) {
            this.subStack.back();
          }
          this.backLabel = 'Back';
          this.nextLabel = 'Next';
        } else {
          this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
        }
      }
    }
  ]
});
