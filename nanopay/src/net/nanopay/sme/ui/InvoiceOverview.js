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
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceOverview',
  extends: 'foam.u2.View',

  documentation: `
    Invoice detail view of Payable/Receivable for Ablii.
    Displays invoice information, transaction details and
    invoice changes (Invoice history).

    Link to spreadsheet that outlines secondary actions displayed based on Invoice.status
    https://docs.google.com/spreadsheets/d/1fgcSFAxg0KgteBws6l5WrvsPXS4QyuOqZDof-Gxs01Q/edit?usp=sharing
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.notification.NewInvoiceNotification',
    'net.nanopay.model.Invitation',
    'net.nanopay.tx.ConfirmationFileLineItem',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.TaxLineItem'
  ],

  imports: [
    'accountDAO',
    'auth',
    'canReceiveCurrencyDAO',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'ctrl',
    'currencyDAO',
    'email',
    'invoiceDAO',
    'invitationDAO',
    'notificationDAO',
    'publicUserDAO',
    'pushMenu',
    'menuDAO',
    'notify',
    'stack',
    'transactionDAO',
    'translationService',
    'user',
    'userDAO'
  ],

  css: `
    ^ {
      width: 1024px;
      margin: auto;
      padding: 24px;
    }
    ^ .left-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 25px);
      margin-right: 5px;
    }
    ^ .right-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 40px);
      margin-left: 40px;
    }
    ^back-area {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #8e9090;
      font-size: 16px;
      font-weight: 400;
      width: 120px;
    }
    ^go-back-label {
      margin-left: 12px;
    }
    ^ .payment-content {
      padding: 0px 14px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    ^ .confirmation-link-content {
      padding: 0 14px;
      margin-bottom: 10px;
    }
    ^ .invoice-history-content {
      padding: 14px;
      border-radius: 4px;
    }
    ^ .actions-wrapper {
      color: #8e9090;
      margin: 17px 0px 17px 0px;
    }
    ^ .foam-u2-ActionView {
      width: 158px;
      margin-right: 5%;
      display: inline-block;
    }
    ^back-arrow {
      font-size: 20pt;
    }
    ^ .invoice-row {
      margin-bottom: 24px;
    }
    ^ .invoice-text {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
      line-height: 1.5;
    }
    ^ .subheading {
      font-size: 16px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    ^ .foam-u2-history-HistoryView {
      background: none;
      padding-left: 0px;
      margin-left: -13px;
      height: auto;
      padding-top: 15px;
    }
    ^ .net-nanopay-invoice-ui-history-InvoiceHistoryView {
      height: auto;
    }
    ^ .foam-u2-history-HistoryView h2 {
      display: none;
    }
    ^align-top {
      vertical-align: top;
      margin-top: -2px;
    }
    ^header-align-top {
      display: inline-block;
      vertical-align: middle;
    }
    ^header-align-right {
      display: inline-block;
      vertical-align: middle;
      float: right;
    }
    ^annotation {
      font-size: 10px;
    }
    ^ .date-display-box {
      width: 403px !important;
      font-size: 14px !important;
      height: 35px !important;
      border: solid 1px #8e9090 !important;
      background: #fff !important;
      border-radius: 3px !important;
      font-weight: 400 !important;
      box-shadow: none !important;
      padding-top: 2px;
    }
    ^ .date-display-text {
      color: /*%BLACK%*/ #1e1f21 !important;
    }
    ^ .net-nanopay-invoice-ui-modal-RecordPaymentModal {
      overflow: auto;
    }
  `,

  messages: [
    { name: 'BACK', message: 'Go back' },
    { name: 'PAYMENT_DETAILS', message: 'Payment details' },
    { name: 'EXCHANGE_RATE', message: 'Exchange rate' },
    { name: 'PAYMENT_FEE', message: 'Fee' },
    { name: 'AMOUNT_DUE', message: 'Amount due' },
    { name: 'AMOUNT_PAID', message: 'Amount paid' },
    { name: 'DATE_CREDITED', message: 'Date credited' },
    { name: 'ESTIMATED_CREDIT_DATE', message: 'Estimated credit date' },
    { name: 'INVOICE_HISTORY', message: 'History' },
    { name: 'MARK_AS_COMP_MESSAGE', message: 'Mark as complete' },
    { name: 'VOID_MESSAGE', message: 'Mark as void' },
    { name: 'EMAIL_MSG_ERROR', message: 'An error occurred while sending a reminder, please try again later.' },
    { name: 'EMAIL_MSG', message: 'Invitation sent' },
    { name: 'PART_ONE_SAVE', message: 'Invoice #' },
    { name: 'PART_TWO_SAVE_SUCCESS', message: 'has successfully been voided.' },
    { name: 'PART_TWO_SAVE_ERROR', message: 'could not be voided at this time. Please try again later.' },
    { name: 'TXN_CONFIRMATION_LINK_TEXT', message: 'View AscendantFX Transaction Confirmation' },
    { name: 'ANNOTATION', message: '* The dates above are estimates and are subject to change.' },
    { name: 'RECONCILED_MESSAGE', message: 'Reconcile' },
    { name: 'RECONCILED_SUCCESS', message: 'Invoice successfully reconciled' },
    { name: 'REECONCILED_ERROR', message: 'An error occurred reconciling invoice' }
  ],

  constants: [
    {
      type: 'String',
      name: 'VOID_ICON',
      value: 'images/ablii/void/void_grey.svg'
    },
    {
      type: 'String',
      name: 'VOID_ICON_HOVER',
      value: 'images/ablii/void/void_purple.svg'
    },
    {
      type: 'String',
      name: 'COMPLETE_ICON',
      value: 'images/ablii/mark-as-complete/complete_grey.svg'
    },
    {
      type: 'String',
      name: 'COMPLETE_ICON_HOVER',
      value: 'images/ablii/mark-as-complete/complete_purple.svg'
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: `Denotes whether this view is for a payable
          or a receivable.`
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice',
      documentation: 'The invoice object passed from Payables/Receivables view.'
    },
    {
      class: 'FObjectProperty',
      name: 'relatedTransaction'
    },
    {
      class: 'Boolean',
      name: 'showTran'
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      expression: function() {
        if ( this.isPayable ) {
          this.user.accounts.find(this.invoice.account).then((account) => {
              this.bankAccount = account;
            });
        } else if ( ! this.isPayable && this.invoice.destinationAccount ) {
          this.user.accounts
            .find(this.invoice.destinationAccount).then((account) => {
              this.bankAccount = account;
            });
        } else {
          this.user.accounts
            .where(
              this.AND(
                this.EQ(this.Account.IS_DEFAULT, true),
                this.OR(
                  this.EQ(this.CABankAccount.TYPE, 'CABankAccount'),
                  this.EQ(this.USBankAccount.TYPE, 'USBankAccount')
                )
              )
            ).select().then((account) => {
              this.bankAccount = account.array.shift();
            });
        }
        return null;
      }
    },
    {
      class: 'Boolean',
      name: 'showBankAccount',
      expression: function(invoice) {
        return invoice.status === this.InvoiceStatus.PENDING_APPROVAL ||
          invoice.status === this.InvoiceStatus.PROCESSING ||
          invoice.status === this.InvoiceStatus.PAID;
      },
      documentation: `Only show bank accounts when it is requires
        approval, processing & complete`
    },
    {
      class: 'Boolean',
      name: 'isCrossBorder'
    },
    {
      class: 'String',
      name: 'exchangeRateInfo'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TaxLineItem',
      name: 'taxItems',
      factory: function() {
        return [];
      }
    },
    {
      class: 'String',
      name: 'fee'
    },
    {
      class: 'String',
      name: 'bankAccountLabel',
      expression: function(isPayable) {
        return isPayable ? 'Withdraw from' : 'Deposit to';
      }
    },
    {
      class: 'Boolean',
      name: 'isPaid',
      expression: function(invoice) {
        return invoice.status === this.InvoiceStatus.PAID;
      }
    },
    {
      class: 'Boolean',
      name: 'isProcess',
      expression: function(invoice) {
        return invoice.status === this.InvoiceStatus.PROCESSING;
      }
    },
    {
      class: 'Boolean',
      name: 'isProcessOrComplete',
      expression: function(invoice) {
        return invoice.status === this.InvoiceStatus.PROCESSING ||
          invoice.status === this.InvoiceStatus.PAID;
      }
    },
    {
      class: 'Boolean',
      name: 'isPendingApproval',
      factory: function() {
        return this.invoice.status === this.InvoiceStatus.PENDING_APPROVAL;
      }
    },
    {
      class: 'Boolean',
      name: 'canApproveInvoice',
      expression: async function(invoice$status) {
        let canPay = await this.auth.check(null, 'business.invoice.pay') && await this.auth.check(null, 'user.invoice.pay');
        return canPay && invoice$status === this.InvoiceStatus.PENDING_APPROVAL;
      }
    },
    {
      class: 'Boolean',
      name: 'canReconcile',
      documentation: `This boolean is a check for invoice ability to reconcile.`,
      expression: function(invoice$payeeReconciled, invoice$payerReconciled, invoice$status, isPayable) {
        return invoice$status === this.InvoiceStatus.PAID &&
          (( ! invoice$payerReconciled && isPayable ) ||
          ( ! invoice$payeeReconciled && ! isPayable ));
      }
    },
    {
      class: 'Boolean',
      name: 'isMarkCompletable',
      documentation: `This boolean is a check for receivable invoices that are completed from a user's perspective but money is yet to be fully transfered.
      Depspite the current requirements requiring this, the current(Jan 2019) implementation does not have this scenerio possible.`,
      expression: function(invoice$status, isPayable) {
        return ! isPayable &&
        ( invoice$status === this.InvoiceStatus.PENDING_APPROVAL ||
          invoice$status === this.InvoiceStatus.SCHEDULED ||
          invoice$status === this.InvoiceStatus.UNPAID ||
          invoice$status === this.InvoiceStatus.OVERDUE
        );
      }
    },
    {
      class: 'Boolean',
      name: 'isVoidable',
      documentation: `Either payable or receivable invoices that are unpaid or overdue, are voidable`,
      expression: function(invoice$status, invoice$createdBy) {
        return this.user.id === invoice$createdBy &&
        ( invoice$status === this.InvoiceStatus.UNPAID ||
          invoice$status === this.InvoiceStatus.OVERDUE ||
          invoice$status === this.InvoiceStatus.PENDING_APPROVAL ) && !
        ( ( this.QuickbooksInvoice.isInstance(this.invoice) || this.XeroInvoice.isInstance(this.invoice) ) && this.isPayable );
      }
    },
    {
      class: 'Boolean',
      name: 'isSendRemindable',
      documentation: `The ability to send a reminder is for receivable invoices that are either overdue or unpaid (which happens to be the isVoidable conditions).
      The current(Jan 2019) implementation has disabled this feature, due to a potential spam possibility. Issue described here: https://github.com/nanoPayinc/NANOPAY/issues/5586`,
      expression: function(isVoidable, isPayable) {
        return isVoidable && ! isPayable;
      }
    },
    {
      name: 'formattedAmountPaid',
      value: '--',
      documentation: `formattedAmountPaid is the amount due
        and contains the currency symbol.`
    },
    {
      class: 'String',
      name: 'formattedAmountDue',
      documentation: `formattedAmountDue is the amount due
        and contains the currency symbol.`,
      expression: function(invoice, invoice$destinationCurrency, invoice$amount) {
        // Format the amount & add the currency symbol
        if ( invoice$destinationCurrency !== undefined ) {
          return this.currencyDAO.find(invoice$destinationCurrency).then((currency) => {
            return currency.format(invoice$amount);
          });
        }
        return Promise.resolve();
      }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'transactionConfirmationPDF',
      documentation: `Order confirmation, as a PDF, for the Payer.
    `
    }
  ],

  methods: [
    function init() {
      this.transactionDAO.find(this.invoice.paymentId).then((transaction) => {
        if ( transaction ) {
          this.relatedTransaction = transaction;
          this.showTran = true;

          var bankAccountId = this.isPayable ?
              transaction.sourceAccount :
              transaction.destinationAccount;

          if ( this.FXSummaryTransaction.isInstance(transaction) ) {

            // Find FXLineItems and FeeLineItems
            let lineItems = transaction.lineItems;
            let taxes = [];
            for ( i=0; i < lineItems.length; i++ ) {
              if ( this.FxSummaryTransactionLineItem.isInstance(lineItems[i]) ) {
                this.exchangeRateInfo = lineItems[i].rate;
              } else if ( this.FeeSummaryTransactionLineItem.isInstance(lineItems[i]) ) {
                this.fee = lineItems[i].totalFee;
              } else if ( this.TaxLineItem.isInstance(lineItems[i]) ) {
                taxes.push(lineItems[i]);
              }
            }
            this.taxItems = taxes;

          } else if ( transaction.type === 'AbliiTransaction' ) {
            this.currencyDAO.find(transaction.sourceCurrency)
              .then((currency) => {
                this.fee = currency.format(transaction.getCost());
              });
          }

          this.accountDAO.find(bankAccountId).then((account) => {
            this.currencyDAO.find(account.denomination).then((currency) => {
              this.formattedAmountPaid = currency.format(transaction.amount);
            });

            if ( this.invoice.destinationCurrency === account.denomination ) {
              this.isCrossBorder = false;
            } else {
              this.isCrossBorder = true;
            }
          });

          for ( var i = 0; i < transaction.lineItems.length; i++ ) {
            if ( this.ConfirmationFileLineItem.isInstance( transaction.lineItems[i] ) ) {
              this.transactionConfirmationPDF = transaction.lineItems[i].file;
              break;
            }
          }

        } else {
          this.currencyDAO.find(this.invoice.chequeCurrency).then((currency) => {
            this.formattedAmountPaid = currency.format(this.invoice.chequeAmount);
          });
        }
      });
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().add(this.slot(function() {
            return this.E().startContext({ data: this })
              .start()
                .addClass(this.myClass('back-area'))
                .start({
                  class: 'foam.u2.tag.Image',
                  data: 'images/ablii/gobackarrow-grey.svg'
                  })
                  .addClass(this.myClass('back-arrow'))
                .end()
                .start('span')
                  .addClass(this.myClass('go-back-label'))
                  .add(this.BACK)
                .end()
                .on('click', () => {
                  var menuId = this.isPayable ? 'mainmenu.invoices.payables'
                    : 'mainmenu.invoices.receivables';
                  this.menuDAO
                    .find(menuId)
                    .then((menu) => menu.launch());
                })
              .end()
              .start()
                .start()
                  .addClass(this.myClass('header-align-top'))
                  .addClass('x-large-header')
                  .add(this.PART_ONE_SAVE + this.invoice.invoiceNumber)
                .end()
                // Dynamic create the primary action
                .start()
                  .addClass(this.myClass('header-align-right'))
                  .tag(this.PAY_NOW, { size: 'LARGE' })
                  .tag(this.EDIT, { size: 'LARGE' })
                  .tag(this.PAID, { size: 'LARGE' })
                  .tag(this.APPROVE, { size: 'LARGE' })
                .end()
              .end()
            .endContext();
          }))
          .end()
        .end()

        // Secondary Actions: View link in documentation for more info
        .start()
          .addClass('actions-wrapper')
          // Void Button :
          .start().show(this.isVoidable$).addClass('inline-block')
            .addClass('sme').addClass('link-button')
            .start('img').addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.VOID_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.VOID_ICON_HOVER)
            .end()
            .add(this.VOID_MESSAGE)
            .on('click', () => this.saveAsVoid())
          .end()
          // Mark as Complete Button :
          .start().addClass('inline-block').show(this.isMarkCompletable$)
            .addClass('sme').addClass('link-button')
            .start('img').addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.COMPLETE_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.COMPLETE_ICON_HOVER)
            .end()
            .add(this.MARK_AS_COMP_MESSAGE)
            .on('click', () => this.markAsComplete())
          .end()
          .start().addClass('inline-block').show(this.canReconcile$)
            .addClass('sme').addClass('link-button')
            .start('img').addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.COMPLETE_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.COMPLETE_ICON_HOVER)
            .end()
            .add(this.RECONCILED_MESSAGE)
            .on('click', () => this.markAsReconciled())
          .end()
        .end()

        .start().addClass('full-invoice')
          .start()
            .addClass('left-block')
            .addClass('invoice-content')
            .tag({ class: 'net.nanopay.sme.ui.InvoiceDetails', invoice$: this.invoice$ })
          .end()
          .start().addClass('right-block')
            .start().addClass('payment-content')
              .add(this.slot((relatedTransaction) => {
                if ( ! relatedTransaction ) return;
                return this.E()
                  .start({
                    class: 'net.nanopay.tx.SummaryTransactionCitationView',
                    data: relatedTransaction,
                    processingDate: this.invoice.processingDate,
                    showTransactionDetail: true
                  });
              }))
            .end()

            .add(this.slot(function(transactionConfirmationPDF) {
              if ( transactionConfirmationPDF != null ) {
                return this.E().start()
                .tag({
                  class: 'net.nanopay.sme.ui.Link',
                  data: self.transactionConfirmationPDF.address,
                  text: self.TXN_CONFIRMATION_LINK_TEXT
                })
              }
            }))

            .start()
              .addClass('invoice-history-content')
              .start()
                .addClass('subheading')
                .add(this.INVOICE_HISTORY)
              .end()
              .tag({
                class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                id: this.invoice.id
              })
            .end()
          .end()
        .end()
      .end();
    },

    function saveAsVoid() {
      this.ctrl.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.MarkAsVoidModal',
        invoice: this.invoice
      }));
    },

    function markAsComplete() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
        invoice: this.invoice
      }));
    },

    function markAsReconciled() {
      this.invoice[this.isPayable ? 'payerReconciled' : 'payeeReconciled'] = true;
      this.invoiceDAO.put(this.invoice).then((r) => {
        this.notify(this.RECONCILED_SUCCESS, '', this.LogLevel.INFO, true);
      }).catch((err) => {
        this.notify(this.RECONCILED_ERROR, '', this.LogLevel.ERROR, true);
      });
    },
  ],

  actions: [
    {
      name: 'edit',
      label: 'Edit',
      isAvailable: function() {
        return this.invoice.status === this.InvoiceStatus.DRAFT;
      },
      code: function(X) {
        var checkAndNotifyAbility = this.isPayable ?
          this.checkAndNotifyAbilityToPay :
          this.checkAndNotifyAbilityToReceive;

        checkAndNotifyAbility().then((result) => {
          if ( ! result ) return;
          var menuName = this.isPayable ? 'send' : 'request';
          X.menuDAO.find(`sme.quickAction.${menuName}`).then((menu) => {
            var clone = menu.clone();
            Object.assign(clone.handler.view, {
              isForm: true,
              isDetailView: false,
              invoice: this.invoice.clone()
            });
            clone.launch(X, X.controllerView);
          });
        });
      }
    },
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        return this.isPayable &&
          (
            this.invoice.status === this.InvoiceStatus.UNPAID ||
            this.invoice.status === this.InvoiceStatus.OVERDUE
          );
        // TODO: auth.check(this.user, 'invoice.pay');
      },
      code: function(X) {
        var checkAndNotifyAbility = this.isPayable ?
          this.checkAndNotifyAbilityToPay :
          this.checkAndNotifyAbilityToReceive;

        checkAndNotifyAbility().then((result) => {
          if ( result ) {
            // Check if payee has a supported bank account. Needed for Xero/Quickbook invoices
            var request = this.CanReceiveCurrency.create({
              userId: this.invoice.payeeId,
              payerId: this.invoice.payerId,
              currencyId: this.invoice.destinationCurrency,
              isRecievable: false
            });
            this.canReceiveCurrencyDAO.put(request).then((responseObj) => {
              if ( ! responseObj.response ) {
                this.notify(responseObj.message, '', this.LogLevel.ERROR, true);
                return;
              }
              X.menuDAO.find('sme.quickAction.send').then((menu) => {
                var clone = menu.clone();
                Object.assign(clone.handler.view, {
                  isPayable: this.isPayable,
                  isForm: false,
                  isDetailView: true,
                  invoice: this.invoice.clone()
                });
                clone.launch(X, X.controllerView);
              });
            });
          }
        });
      }
    },
    {
      name: 'paid',
      label: 'Paid',
      isAvailable: function() {
        return this.isPayable && this.isProcessOrComplete;
      },
      isEnabled: function() {
        // Always disabled the paid button
        return false;
      },
      code: function() {
        // Do nothing since it always disabled
      }
    },
    {
      name: 'approve',
      label: 'Approve',
      isAvailable: function(isPendingApproval, canApproveInvoice) {
        return this.isPayable && isPendingApproval && canApproveInvoice;
      },
      isEnabled: function(isPendingApproval, canApproveInvoice) {
        return canApproveInvoice && isPendingApproval;
      },
      availablePermissions: ['business.invoice.pay', 'user.invoice.pay'],
      code: function(X) {
        X.menuDAO.find('sme.quickAction.send').then((menu) => {
          var clone = menu.clone();
          Object.assign(clone.handler.view, {
            isApproving: true,
            isForm: false,
            isDetailView: true,
            invoice: this.invoice.clone()
          });
          clone.launch(X, X.controllerView);
        }).catch((err) => {
          console.warn('Error occurred when redirecting to approval payment flow: ', err);
        });
      }
    },
    {
      name: 'sendReminder',
      label: 'Send a reminder',
      isAvailable: function() {
        // return this.isSendRemindable;
        return false;
      },
      code: function(X) {
        // TODO: need to write a service that would be called by client,
        // for this feature. But need to confirm feature requirements prior
        // to implementation. Some have suggested this action should not exist
      }
    }
  ]

});
