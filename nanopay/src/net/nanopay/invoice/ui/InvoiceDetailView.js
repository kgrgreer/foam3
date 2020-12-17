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
  name: 'InvoiceDetailView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'ctrl',
    'hideSummary',
    'notificationDAO',
    'notify',
    'publicUserDAO',
    'stack',
    'user'
  ],

  exports: [
    'frequency',
    'endsAfter',
    'nextInvoiceDate'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.notification.NewInvoiceNotification'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isBill',
      documentation: `Denotes whether this view is for a payable invoice (bill)
          or a receivable invoice (sale).`,
      value: false
    },
    {
      class: 'String',
      name: 'otherPartyName',
      documentation: `The name of the other party involved with this invoice.`,
      expression: function(isBill) {
        return isBill ? 'Vendor' : 'Customer';
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxRecurring',
      value: false
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
      name: 'selectedUser',
      value: {}
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
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.publicUserDAO.where(X.data.NEQ(X.data.PublicUserInfo.ID, X.user.id)),
          placeholder: `Please Select a ${X.data.otherPartyName}`,
          objToChoice: function(user) {
            var username = user.businessName || user.organization ||
                user.toSummary();
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      },
      postSet: function(ov, nv) {
        var self = this;
        this.publicUserDAO.find(nv).then(function(u) {
          self.selectedUser = u;
        });
      }
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
    ^ .small-input-box {
      margin: 20px 0;
    }
    ^ .label{
      margin: 0;
    }
    ^ .foam-u2-ActionView-cancel {
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
    ^ .net-nanopay-ui-BusinessCard {
      margin-bottom: 30px;
    }
    ^ .foam-u2-tag-Select{
      width: 450px;
    }
    ^ .container-1 {
      margin-left: 60px;
      display: inline-block;
    }
    ^ .container-2 {
      margin-left: 40px;
      display: inline-block;
      position: relative;
    }
    ^ .property-amount {
      width: 215px;
      padding-left: 115px;
    }
    ^ .customer-div {
      vertical-align: top;
      margin-top: 10px;
      width: 420px;
      display: inline-block;
    }
    ^ .net-nanopay-tx-ui-CurrencyChoice {
      position: absolute;
      top: 132px;
      width: 85px;
      margin-left: 7px;
      border-right: 1px solid lightgrey;
    }
    ^ .foam-u2-PopupView {
      left: -20px !important;
      top: 45px !important;
    }
  `,

  methods: [
      function initE() {
        this.SUPER();
        this.hideSummary = true;

        this
          .addClass(this.myClass())
          .start().addClass('button-row')
            .startContext({ data: this })
              .start(this.DELETE_DRAFT).end()
              .start(this.SAVE_AND_PREVIEW).addClass('float-right').end()
            .endContext()
          .end()
          .start().add('New Invoice').addClass('light-roboto-h2').end()
          .start().addClass('white-container')
            .start().addClass('information')
              .start().addClass('customer-div')
                .start().addClass('label').add(this.otherPartyName$).end()
                .startContext({ data: this })
                  .start(this.USER_LIST).end()
                .endContext()
              .end()
              .start().addClass('container-1')
                .start().addClass('label').add('Invoice #').end()
                .start(this.Invoice.INVOICE_NUMBER)
                  .addClass('small-input-box')
                .end()
                .start().addClass('label').add('PO #').end()
                .start(this.Invoice.PURCHASE_ORDER)
                  .addClass('small-input-box')
                .end()
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
            .start().show(this.selectedUser$.map((a) => {
              this.selectedUser.status = this.AccountStatus.ACTIVE;
              return this.PublicUserInfo.isInstance(a);
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
                .start().addClass('inline').style({ 'margin-right': '36px' })
                  .start().addClass('label')
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
        this.hideSummary = false;
        X.stack.back();
      }
    },
    {
      name: 'saveAsDraft',
      label: 'Save As Draft',
      code: function(X) {
        X.dao.put(this);
        X.stack.push({
          class: this.isBill ?
              'net.nanopay.invoice.ui.SalesView' :
              'net.nanopay.invoice.ui.ExpensesView'
        });
      }
    },
    {
      name: 'saveAndPreview',
      label: 'Send',
      code: function(X) {
        var dueDate = this.data.dueDate;

        if ( ! this.userList ) {
          X.notify(`Please select a ${this.otherPartyName}.`, '', this.LogLevel.ERROR, true);
          return;
        }

        if ( ! this.data.amount || this.data.amount < 0 ) {
          X.notify('Please enter amount.', '', this.LogLevel.ERROR, true);
          return;
        }

        if ( ! (dueDate instanceof Date && ! isNaN(dueDate.getTime())) ) {
          X.notify('Please user this format: yyyy/mm/dd', '', this.LogLevel.ERROR, true);
          return;
        }

        // Set the time to the very end of the day so that invoices are not
        // shown as overdue until the day after their due date.
        dueDate.setUTCHours(23, 59, 59, 999);

        var inv = this.Invoice.create({
          payerId: this.isBill ? this.user.id : this.userList,
          payeeId: this.isBill ? this.userList : this.user.id,
          createdBy: this.user.id,
          amount: this.data.amount,
          dueDate: dueDate,
          purchaseOrder: this.data.purchaseOrder,
          destinationCurrency: this.currencyType.id,
          note: this.data.note,
          invoiceFile: this.data.invoiceFile,
          invoiceNumber: this.data.invoiceNumber
        });

        var dao = this.isBill ? this.user.expenses : this.user.sales;
        dao
          .put(inv)
          .then(() => {
            X.stack.back();
          })
          .catch((err) => {
            X.notify(err.message, '', this.LogLevel.ERROR, true);
          });

        // if ( X.frequency && X.endsAfter && X.nextInvoiceDate && this.amount) {
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
        //   });

        //   X.recurringInvoiceDAO.put(recurringInvoice).then(function(a){
        //     self.recurringInvoice = a;
        //     X.dao.put(self);
        //   });
        // } else {
        //   X.dao.put(this);
        // }

        this.hideSummary = false;
      }
    }
  ]
});
