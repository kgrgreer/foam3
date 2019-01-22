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
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.notification.NewInvoiceNotification',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'accountDAO',
    'ctrl',
    'currencyDAO',
    'email',
    'hasPassedCompliance',
    'invoiceDAO',
    'invitationDAO',
    'notificationDAO',
    'publicUserDAO',
    'pushMenu',
    'menuDAO',
    'notify',
    'stack',
    'transactionDAO',
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
    ^ .parent {
      margin-left: 15px;
    }
    ^ .payment-content {
      padding: 0px 14px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    ^ .invoice-history-content {
      padding: 14px;
      border-radius: 4px;
    }
    ^ .actions-wrapper {
      padding: 23px 0px 34px;
      color: #8e9090;
      margin-top: 2px;
    }
    ^ .net-nanopay-ui-ActionView {
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
    ^ .invoice-text-left {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .subheading {
      margin-bottom: 16px;
      font-weight: bold;
    }
    ^ .foam-u2-history-HistoryView {
      background: none;
      padding-left: 0px;
      margin-left: -13px;
      height: auto;
      padding-top: 5px;
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
  `,

  messages: [
    { name: 'BACK', message: 'Go back' },
    { name: 'PAYMENT_DETAILS', message: 'Payment details' },
    { name: 'EXCHANGE_RATE', message: 'Exchange rate' },
    { name: 'PAYMENT_FEE', message: 'Fee' },
    { name: 'REQUEST_AMOUNT', message: 'Requested amount' },
    { name: 'PAID_AMOUNT', message: 'Paid amount' },
    { name: 'PAID_DATE', message: 'Paid date' },
    { name: 'PAYMENT_HISTORY', message: 'History' },
    { name: 'MARK_AS_COMP_MESSAGE', message: 'Mark as complete' },
    { name: 'VOID_MESSAGE', message: 'Mark as void' },
    { name: 'EMAIL_MSG_ERROR', message: 'An error occured while sending a reminder, please try again later.' },
    { name: 'EMAIL_MSG', message: 'Invitation sent!' },
    { name: 'PART_ONE_SAVE', message: 'Invoice #' },
    { name: 'PART_TWO_SAVE_SUCCESS', message: 'has successfully been voided.' },
    { name: 'PART_TWO_SAVE_ERROR', message: 'could not be voided at this time. Please try again later.' },

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
      name: 'bankAccount'
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
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
      name: 'isMarkCompletable',
      documentation: `This boolean is a check for receivable invoices that are completed from a user's perspective but money is yet to be fully transfered.
      Depspite the current requirements requiring this, the current(Jan 2019) implementation does not have this scenerio possible.`,
      expression: function(invoice$status, isPayable) {
       return ! isPayable &&
        ( invoice$status === this.InvoiceStatus.PENDING_APPROVAL ||
          invoice$status === this.InvoiceStatus.SCHEDULED || invoice$status === this.InvoiceStatus.UNPAID || invoice$status === this.InvoiceStatus.OVERDUE);
      }
    },
    {
      class: 'Boolean',
      name: 'isVoidable',
      documentation: `Either payable or receivable invoices that are unpaid or overdue, are voidable`,
      expression: function(invoice$status, invoice$createdBy) {
        return this.user.id === invoice$createdBy &&
        ( invoice$status === this.InvoiceStatus.UNPAID ||
          invoice$status === this.InvoiceStatus.OVERDUE );
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
    }
  ],

  methods: [
    function init() {
      // Dynamic create top button based on 'isPayable'
      this.generateTop(this.isPayable);

      this.transactionDAO.find(this.invoice.paymentId).then((transaction) => {
        if ( transaction ) {
          this.relatedTransaction = transaction;
          this.showTran = true;

          var bankAccountId = this.isPayable ?
              transaction.sourceAccount :
              transaction.destinationAccount;

          if ( transaction.name === 'Foreign Exchange' && transaction.fxRate ) {
            this.exchangeRateInfo = `1 ${sourceCurrency} @ `
                + `${transaction.fxRate.toFixed(4)} ${transaction.destinationCurrency}`;
          }

          this.accountDAO.find(bankAccountId).then((account) => {
            this.bankAccount = account;
            this.currencyDAO.find(account.denomination).then((currency) => {
              this.formattedAmount = `${currency.format(transaction.amount)} ${currency.alphabeticCode}`;
            });

            if ( this.invoice.destinationCurrency === account.denomination ) {
              this.isCrossBorder = false;
            } else {
              this.isCrossBorder = true;
            }
          });
        }
      });
    },

    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass('x-large-header')
            .add('Invoice #' + this.invoice.invoiceNumber)
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
              .attr('src', this.COMPLETE_ICON_COMPLETE)
            .end()
            .add(this.MARK_AS_COMP_MESSAGE)
            .on('click', () => this.markAsComplete())
          .end()
        .end()

        .start().addClass('full-invoice')
          .start()
            .addClass('left-block')
            .addClass('invoice-content')
            .tag({ class: 'net.nanopay.sme.ui.InvoiceDetails', invoice$: this.invoice$ })
          .end()
          .start()
            .addClass('right-block')
            .start()
              .addClass('payment-content')
              .start()
                .addClass('subheading')
                .add(this.PAYMENT_DETAILS)
              .end()

              .start().show(this.showTran$)
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left').show(this.isCrossBorder$)
                    .start().addClass('table-content').add(this.EXCHANGE_RATE).end()
                    .add(this.exchangeRateInfo$)
                  .end()
                  // Only show fee when it is a payable
                  .start().addClass('invoice-text-right').show(this.isPayable)
                    .start().addClass('table-content').add(this.PAYMENT_FEE).end()
                    .add('None')
                  .end()
                .end()
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left')
                    .start().addClass('table-content').add(this.REQUEST_AMOUNT).end()
                    .add(this.formattedAmount$)
                  .end()
                  .start().addClass('invoice-text-right')
                    .start().addClass('table-content').add(this.PAID_AMOUNT).end()
                    .start().show(this.isPaid)
                      .add(this.formattedAmount$)
                    .end()
                    .start().add('-').hide(this.isPaid).end()
                  .end()
                .end()
                .start().addClass('invoice-row')
                  .start().addClass('invoice-text-left')
                    .start().addClass('table-content').add(this.bankAccountLabel).end()
                    .add(this.bankAccount$.map((account) => {
                      if ( account != null ) {
                        return `${account.name} ${'*'.repeat(account.accountNumber.length-4)} ${account.accountNumber.slice(-4)}`;
                      } else {
                        return '';
                      }
                    }))
                  .end()
                  .start().addClass('invoice-text-right')
                    .start().addClass('table-content').add(this.PAID_DATE).end()
                    .start().show(this.isPaid)
                      .add(this.relatedTransaction$.dot('completionDate'))
                    .end()
                    .start().add('-').hide(this.isPaid).end()
                  .end()
                .end()
              .end()
            .end()

            .start()
              .addClass('invoice-history-content')
              .start()
                .addClass('subheading')
                .add(this.PAYMENT_HISTORY)
              .end()
              .start({
                class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                id: this.invoice.id
              }).end()
            .end()
          .end()
        .end()
      .end();
    },

    function generateTop(isPayable) {
      var action;
      if ( isPayable ) {
        action = this.PAY_NOW;
      } else {
        action = this.SEND_REMINDER;
      }
      // 'startContext' is required to pass the context to the button
      this
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('back-area'))
            .start('span')
              .addClass(this.myClass('back-arrow'))
              .add('←')
            .end()
            .start('span')
              .addClass('parent')
              .add(this.BACK)
            .end()
            .on('click', () => {
              var menuId = this.isPayable ? 'sme.main.invoices.payables'
                : 'sme.main.invoices.receivables';
              this.menuDAO
                .find(menuId)
                .then((menu) => menu.launch());
            })
          .end()
          .start().style({ 'text-align': 'right' })
            .start(action)
              .addClass('sme').addClass('button').addClass('primary')
            .end()
          .end()
        .endContext();
    },
    function saveAsVoid() {
      if ( ! this.isVoidable ) return;
      this.invoice.paymentMethod = this.PaymentStatus.VOID;
      this.invoiceDAO.put(this.invoice).then(
        (_) => {
          this.isVoidable = false;
          this.notify(`${this.PART_ONE_SAVE}${this.invoice.invoiceNumber} ${this.PART_TWO_SAVE_SUCCESS}`);
        }
      ).catch( (_) => {
        this.notify(`${this.PART_ONE_SAVE}${this.invoice.invoiceNumber} ${this.PART_TWO_SAVE_ERROR}`);
      });
    },
    function markAsComplete() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
        invoice: this.invoice
      }));
    },
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        return this.invoice.paymentMethod === this.PaymentStatus.NONE ||
          this.invoice.draft;
        // TODO: auth.check(this.user, 'invoice.pay');
      },
      code: function(X) {
        if ( this.hasPassedCompliance() ) {
          X.menuDAO.find('sme.quickAction.send').then((menu) => {
            var clone = menu.clone();
            Object.assign(clone.handler.view, {
              isPayable: this.isPayable,
              isForm: false,
              isDetailView: true,
              hasSaveOption: false,
              invoice: this.invoice.clone()
            });
            clone.launch(X, X.controllerView);
          });
        }
      }
    },
    {
      name: 'sendReminder',
      label: 'Send a reminder',
      isAvailable: function() {
        // return this.isSendRemindable;
        return false;
      },
      code: async function(X) {
        // TODO: need to write a service that would be called by client,
        // for this feature. But need to confirm feature requirements prior
        // to implementation. Some have suggested this action should not exist
      }
    }
  ]

});
