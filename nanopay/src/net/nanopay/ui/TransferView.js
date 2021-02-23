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
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: "View to Transfer Amounts From Account to Account",

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.ui.CountdownView',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'notify',
    'transactionDAO',
    'transactionPlannerDAO'
  ],

  exports: [
    'countdownView',
    'invoice',
    'invoiceMode',
    'type',
    'quote'
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
      margin: auto 24px;
    }

    ^ .fromToCol {
      display: inline-block;
      vertical-align: top;
      width: 300px;
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

    ^ .invoiceDetail {
      display: inline-block;
      vertical-align: top;

      font-size: 12px;
      padding-top: 2px;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
    }
  `,

  messages: [
    { name: 'PayInvoice', message: 'Pay Another Invoice' },
    { name: 'NewTransfer', message: 'Make New Transfer' },
    { name: 'Back', message: 'Back' },
    { name: 'Next', message: 'Next' },
    { name: 'NoPartners', message: 'No partners found.' },
    { name: 'NoContacts', message: 'No contacts found.' },
    { name: 'NoAccount', message: 'Please select an account to pay.' },
    { name: 'ZeroAmount', message: 'Transfer amount must be greater than 0.' },
    { name: 'VerifyBank', message: 'Bank Account should be verified for making this transfer.' },
    { name: 'CannotContinue', message: 'Could not continue. Please contact customer support.' },
    { name: 'InsuffientDigitalBalance', message: 'Unable to process payment: insufficient digital balance.' },
    { name: 'CannotProcess', message: 'Unable to process payment: ' }
  ],

  properties: [
    {
      name: 'hasBackOption',
      expression: function(position) {
        return ( position !== 0 || this.invoiceMode === true ) && position !== 4;
      }
    },
    {
      name: 'countdownView',
      factory: function() {
        return this.CountdownView.create();
      }
    },
    {
      name: 'type',
      value: 'regular'
    },
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
        { parent: 'etransfer', id: 'etransfer-transfer-from',     label: 'Transfer from', view: { class: 'net.nanopay.ui.TransferFrom' } },
        { parent: 'etransfer', id: 'etransfer-transfer-to',       label: 'Transfer to',   view: { class: 'net.nanopay.ui.TransferTo'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-planSelectionWizard',  label: 'Choose a Plan', view: { class: 'net.nanopay.ui.transfer.PlanSelectionWizard' } },
        { parent: 'etransfer', id: 'etransfer-transfer-review',   label: 'Review',          view: { class: 'net.nanopay.ui.transfer.TransferReview'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-complete', label: 'Successful',    view: { class: 'net.nanopay.ui.transfer.TransferComplete'  } }
      ];

      this.countdownView.hide();
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
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
          if ( this.viewData.payerPartnerCheck && this.viewData.payerPartner == undefined ) {
            this.notify(this.NoPartners, '', this.LogLevel.ERROR, true);
            return;
          }
          var accountType = this.viewData.payerType;
          var isBankAccount = accountType.substring(accountType.length - 11) == 'BankAccount';
          var isTrustAccount = accountType == 'TrustAccount';
          var isLoanAccount = accountType == 'LoanAccount';

          if ( self.viewData.fromAmount <= 0 ) {
            this.notify(this.ZeroAmount, '', this.LogLevel.ERROR, true);
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
                self.notify(self.VerifyBank, '', self.LogLevel.ERROR, true);
                return;
              }
              self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
            }).catch(function(err) {
              self.notify(self.CannotContinue, '', self.LogLevel.ERROR, true);
            });
          } else {
            // Check if payer has enough digital cash to make the transfer and show
            // an error message if they don't.
            var fundsInsufficient =
              this.viewData.balance < this.viewData.fromAmount;
            if ( ! isLoanAccount && ! isBankAccount && ! isTrustAccount && fundsInsufficient ) {
              this.notify(this.InsuffientDigitalBalance, '', this.LogLevel.ERROR, true);
              return;
            }
            self.subStack.push(self.views[self.subStack.pos + 1].view); // otherwise
          }

        } else if ( this.position === 1 ) {
          var err = '';
          if ( this.viewData.payeeContactCheck && this.viewData.payeeContact == undefined ) {
            err = this.NoContacts;
          } else if  ( this.viewData.payeePartnerCheck && this.viewData.payeePartner == undefined ) {
            err = this.NoPartners;
          } else if ( ! this.invoiceMode && ! this.viewData.payeeAccount && this.viewData.payeeAccountCheck ) {
            err = this.NoAccount;
          }
          if ( err !== '' ) {
            this.notify(err, '', this.LogLevel.ERROR, true);
            return;
          } else {
            this.subStack.push(this.views[this.subStack.pos + 1].view);
          }

          if ( this.invoiceMode ) {
            transaction = this.Transaction.create({
              sourceCurrency: this.viewData.payerDenomination,
              payerId: this.viewData.payer,
              payeeId: this.viewData.payee,
              amount: this.viewData.fromAmount,
              sourceAccount: this.viewData.payerAccount,
              invoiceId: this.invoice.id
            });
          } else {
            transaction = this.Transaction.create({
              sourceCurrency: this.viewData.payerDenomination,
              destinationCurrency: this.viewData.payeeDenomination,
              payerId: this.viewData.payer,
              payeeId: this.viewData.payee,
              amount: this.viewData.fromAmount,
              sourceAccount: this.viewData.payerAccount,
              destinationAccount: this.viewData.payeeAccount
            });
          }

          this.quote = self.transactionPlannerDAO.put(
            self.TransactionQuote.create({
              requestTransaction: transaction
            })
          );
        } else if ( this.position === 3 ) { // Review
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();


          this.transactionDAO.put(self.viewData.transaction)
            .then(function(result) {
              if ( result ) {
                self.viewData.transaction = result;
              }
            })
            .then(function(response) {
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.nextLabel = self.invoiceMode ? self.PayInvoice : self.NewTransfer;
            })
            .catch(function(err) {
              self.notify(self.CannotProcess + err.message, '', self.LogLevel.ERROR, true);
            });
        }  else if ( this.position === 4 ) { // Successful
          this.backLabel = this.Back;
          this.nextLabel = this.Next;
          if ( this.invoiceMode ) {
            X.stack.push({ class: 'net.nanopay.invoice.ui.ExpensesView' });
          } else {
            X.stack.push({ class: 'net.nanopay.ui.TransferView' });
          }
          return;
        } else {
          this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
        }
      }
    }
  ]
});
