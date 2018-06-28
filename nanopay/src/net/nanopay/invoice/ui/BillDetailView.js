foam.CLASS({
    package: 'net.nanopay.invoice.ui',
    name: 'BillDetailView',
    extends: 'foam.u2.View',

    implements: [
      'foam.mlang.Expressions',
    ],

    imports: [
      'hideSaleSummary',
      'notificationDAO',
      'stack',
      'user',
      'userDAO'
    ],

    requires: [
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage',
      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.invoice.ui.NewInvoiceNotification'
    ],

    properties: [
      {
        class: 'Boolean',
        name: 'checkBoxRecurring'
      },
      {
        class: 'Double',
        name: 'endsAfter'
      },
      {
        class: 'Date',
        name: 'nextInvoiceDate'
      },
      {
        class: 'String',
        name: 'frequency',
        view: {
          class: 'foam.u2.view.ChoiceView',
          choices: [
            'Daily',
            'Weekly',
            'Biweekly',
            'Monthly'
          ]
        },
        value: 'Daily'
      },
      {
        name: 'currencyType',
        view: 'net.nanopay.tx.ui.CurrencyChoice'
      },
      {
        name: 'userList',
        view: function(_,X) {
          return foam.u2.view.ChoiceView.create({
            dao: X.userDAO.where(X.data.AND(
              X.data.NEQ(X.data.User.ID, X.user.id),
              // only retrieve the active users
              X.data.EQ(X.data.User.STATUS, 'ACTIVE')
            )),
            placeholder: 'Please Select Customer',
            objToChoice: function(user) {
              var username = user.businessName || user.organization;
              return [user.id, username + ' - (' + user.email + ')'];
            }
          });
        },
        postSet: function(ov, nv) {
          var self = this;
          this.userDAO.find(nv).then(function(u) {
            self.selectedUser = u;
          });
        }
      },
      {
        name: 'selectedUser',
        value: {}
      }
    ],

    css: `
    ^ {
      font-weight: 100;
      width: 970px;
      margin: auto;
    }
    ^ .enable-recurring-text {
      font-size: 12px;
      margin: 20px 0;
    }
    ^ .company-card {
      width: 480px;
      height: 155px;
      margin-top: 20px;
    }
    ^ .small-input-box{
      margin: 20px 0;
    }
    ^ .label{
      margin: 0;
    }
    ^ .net-nanopay-ui-ActionView-cancel {
      margin-left: 457px;
      margin-top: 20px;
    }
    ^ .input-box {
      margin-left: 0;
      margin-top: 15px;
      height: 40px;
    }
    ^ .foam-u2-tag-Select {
      width: 225px;
      height: 40px;
      margin-top: 10px;
    }
    ^ .information {
      height: 110px;
    }
    ^ .net-nanopay-ui-BusinessCard{
      margin-bottom: 30px;
    }
    ^ .foam-u2-tag-Select{
      width: 450px;
    }
    ^ .container-1{
      margin-left: 60px;
      display: inline-block;
    }
    ^ .container-2{
      margin-left: 40px;
      display: inline-block;
    }
    ^ .property-amount{
      width: 215px;
      padding-left: 115px;
    }
    ^ .customer-div{
      vertical-align: top;
      margin-top: 10px;
      width: 420px;
      display: inline-block;
    }
    ^ .net-nanopay-tx-ui-CurrencyChoice{
      position: absolute;
      top: 272px;
      width: 85px;
      margin-left: 7px;
      border-right: 1px solid lightgrey;
    }
    ^ .foam-u2-PopupView{
      left: -20px !important;
      top: 45px !important;
    }
    `,

    methods: [
        function initE() {
          this.SUPER();
          this.hideSaleSummary = true;

          this
          .addClass(this.myClass())
          .start().addClass('button-row')
            .startContext({ data: this })
              .start(this.DELETE_DRAFT).end()
              .start(this.SAVE_AND_PREVIEW).addClass('float-right').end()
              // .start(this.SAVE_AS_DRAFT).addClass('float-right').end()
            .endContext()
          .end()
          .start().add('New Invoice').addClass('light-roboto-h2').end()
          .start().addClass('white-container')
            .start().addClass('information')
              .start().addClass('customer-div')
                .start().addClass('label').add('Customer').end()
                .startContext({ data: this })
                  .start(this.USER_LIST).end()
                .endContext()
              .end()
              .start().addClass('container-1')
                .start().addClass('label').add('Invoice #').end()
                .start(this.Invoice.INVOICE_NUMBER).addClass('small-input-box').end()
                .start().addClass('label').add('PO #').end()
                .start(this.Invoice.PURCHASE_ORDER).addClass('small-input-box').end()
              .end()
              .start().addClass('container-2')
                .start().addClass('label').add('Due Date').end()
                .start(this.Invoice.DUE_DATE).addClass('small-input-box').end()
                .start().addClass('label').add('Amount').end()
                .startContext({ data: this })
                  .start(this.CURRENCY_TYPE).end()
                .endContext()
                .start(this.Invoice.AMOUNT).addClass('small-input-box').end()
              .end()
            .end()
            .start().show(this.selectedUser$.map(function(a) {
              return a.emailVerified;
            }))
              .tag({
                class: 'net.nanopay.ui.BusinessCard',
                business$: this.selectedUser$
              })
            .end()
            .start(this.Invoice.INVOICE_FILE).end()
//            .start()
              // .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxRecurring$ })
              // .add('Enable recurring payments').addClass('enable-recurring-text')
//            .end()
            .startContext({ data: this })
              .start().show(this.checkBoxRecurring$)
                .start().addClass('frequency-div')
                  .start().addClass('label').add('Frequency').end()
                    .start(this.FREQUENCY).end()
                .end()
                .start().addClass('inline').style({ 'margin-right' : '36px' })
                  .start()
                    .addClass('label')
                    .add('Ends After ( ) Occurences')
                  .end()
                  .start(this.ENDS_AFTER).addClass('small-input-box').end()
                .end()
                .start().addClass('inline')
                  .start().addClass('label').add('Next Bill Date').end()
                  .start(this.NEXT_INVOICE_DATE)
                    .addClass('small-input-box')
                  .end()
                .end()
              .end()
            .endContext()
            .start()
              .start().addClass('label').add('Note').end()
              .start(this.Invoice.NOTE).addClass('half-input-box').end()
            .end()
          .end();
        }
    ],

    actions: [
      {
        name: 'deleteDraft',
        label: 'Delete Draft',
        code: function(X) {
          this.hideSaleSummary = false;
          X.stack.back();
        }
      },
      {
        name: 'saveAsDraft',
        label: 'Save As Draft',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({
            class: 'net.nanopay.invoice.ui.ExpensesView'
          });
        }
      },
      {
        name: 'saveAndPreview',
        label: 'Save & Preview',
        code: function(X) {
          var dueDate = this.data.dueDate;

          if ( ! this.userList ) {
            this.add(foam.u2.dialog.NotificationMessage.create({
              message: 'Please Select a Customer.',
              type: 'error'
            }));
            return;
          }

          if ( ! this.data.amount || this.data.amount < 0 ) {
            this.add(foam.u2.dialog.NotificationMessage.create({
              message: 'Please Enter Amount.',
              type: 'error'
            }));
            return;
          }
          // By pass for safari & mozilla type='date' on input support
          // Operator checking if dueDate is a date object if not, makes it so or throws notification.
          if ( isNaN(dueDate) && dueDate != null ) {
            this.add(foam.u2.dialog.NotificationMessage.create({
              message: 'Please Enter Valid Due Date yyyy-mm-dd.',
              type: 'error'
            }));
            return;
          }

          if ( dueDate ) {
            var offsetDate = dueDate.setMinutes(dueDate.getMinutes() +
            new Date().getTimezoneOffset());
          }

          var inv = this.Invoice.create({
            payerId: this.user.id,
            payeeId: this.userList,
            createdBy: this.user.id,
            amount: this.data.amount,
            dueDate: offsetDate,
            purchaseOrder: this.data.purchaseOrder,
            targetCurrency: this.currencyType,
            note: this.data.note,
            invoiceFile: this.data.invoiceFile,
            invoiceNumber: this.data.invoiceNumber
          });

          this.user.expenses.put(inv);

          // if(X.frequency && X.endsAfter && X.nextInvoiceDate && this.amount){
          //   var recurringInvoice = net.nanopay.invoice.model.RecurringInvoice.create({
          //     frequency: X.frequency,
          //     endsAfter: X.endsAfter,
          //     nextInvoiceDate: X.nextInvoiceDate,
          //     amount: this.amount,
          //     payeeId: this.payeeId,
          //     payerId: this.payerId,
          //     invoiceNumber: this.invoiceNumber,
          //     dueDate: this.dueDate,
          //     purchaseOrder: this.purchaseOrder,
          //     payeeName: this.payeeName,
          //     payerName: this.payerName
          //   })
          //   X.recurringInvoiceDAO.put(recurringInvoice).then(function(a){
          //     self.recurringInvoice = a;
          //     X.dao.put(self);
          //   })
          // } else {
          //   X.dao.put(this);
          // }

          this.hideSaleSummary = false;
          X.stack.back();
        }
      }
    ]
});
