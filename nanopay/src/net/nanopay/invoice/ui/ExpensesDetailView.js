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
  name: 'ExpensesDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.account.Balance',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'userDAO',
    'balanceDAO',
    'currentAccount',
    'accountDAO as bankAccountDAO',
    'ctrl',
    'hideSummary',
    'invoiceDAO',
    'notify',
    'stack',
    'user'
  ],

  exports: [
    'as data',
    'openExportModal'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      width: 962px;
      margin: auto;
    }
    ^ h5{
      opacity: 0.6;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-ActionView-backAction {
      border: 1px solid lightgrey;
      // background-color: rgba(164, 179, 184, 0.1);
      vertical-align: top;
      position: relative;
      z-index: 10;
    }
    .foam-u2-ActionView-backAction:hover {
      background: rgba(164, 179, 184, 0.3);
    }
    ^ .foam-u2-ActionView-payNow {
      background-color: #59A5D5;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .foam-u2-ActionView-payNow:hover {
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-payNowDropDown:focus {
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-payNowDropDown {
      width: 30px;
      height: 40px;
      background-color: #59A5D5;
      float: right;
    }
    ^ .foam-u2-ActionView-payNowDropDown:hover{
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-payNowDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }
    ^ .popUpDropDown {
      padding: 0 !important;
      z-index: 1000;
      width: 165px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 165px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
    ^ h5 img{
      margin-left: 20px;
      position: relative;
      top: 3px;
    }
  `,

  properties: [
    'payNowMenuBtn_',
    'payNowPopUp_',
    {
      name: 'verbTenseMsg',
      expression: function(data) {
        return data.paymentMethod === this.PaymentStatus.PROCESSING ?
            'Invoice is' :
            'Invoice has been';
      }
    },
    {
      name: 'foreignExchange',
      factory: function() {
        if ( this.data.sourceCurrency == undefined ) return false;
        return this.data.destinationCurrency !== this.data.sourceCurrency;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideSummary = true;

      // Currently making 'Pay Now' button disappear with CSS
      this.addClass(self.myClass())
        .add(self.data.status$.map(function(status) {
          return self.E().addClass(self.myClass())
            .show( ! 
              (
                foam.util.equals(status, self.InvoiceStatus.VOID) || 
                foam.util.equals(status, self.InvoiceStatus.REJECTED) 
              )
            )
            .start(self.PAY_NOW_DROP_DOWN, null, self.payNowMenuBtn_$).end()
            .start(self.PAY_NOW).show(
              foam.util.equals(status, self.InvoiceStatus.SCHEDULED) ||
              foam.util.equals(status, self.InvoiceStatus.OVERDUE) ||
              foam.util.equals(status, self.InvoiceStatus.UNPAID)
            ).end();
        }))
      .end();

      this
      .addClass(this.myClass())
      .startContext({ data: this })
        .tag(this.BACK_ACTION)
      .endContext()
      .tag(this.EXPORT_BUTTON)
      .start('h5')
        .add('Invoice from ', this.data.payee.toSummary())
        .callIf(this.foreignExchange, function() {
          this.start({
            class: 'foam.u2.tag.Image',
            data: 'images/ic-crossborder.svg'
          }).end();
        })
      .end()
      .callIf(this.foreignExchange, function() {
        this.tag({
          class: 'net.nanopay.invoice.ui.shared.ForeignSingleItemView',
          data: self.data
        });
      })
      .callIf(! this.foreignExchange, function() {
        this.tag({
          class: 'net.nanopay.invoice.ui.shared.SingleItemView',
          data: self.data
        });
      })
      .tag({
        class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
        id: this.data.id
      })
      .br()
      .start('div').addClass('light-roboto-h2')
        .start('span').style({ 'margin-bottom': '0px' }).add('Note: ').end()
        .start('span').style({ 'font-size': '10px' }).add(this.data.note).end()
      .end()
      .br();
    },

    function openExportModal() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.ui.modal.ExportModal',
        exportObj: this.data
      }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X) {
        this.hideSummary = false;
        X.stack.back();
      }
    },
    {
      name: 'exportButton',
      label: 'Export',
      icon: 'images/ic-export.png',
      code: function(X) {
        X.openExportModal();
      }
    },
    {
      name: 'payNow',
      label: 'Pay Now',
      code: function(X) {
        var self = this;
        if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
          X.notify(`${this.verbTenseMsg} ${this.data.paymentMethod.label}.`, '', self.LogLevel.ERROR, true);
          return;
        }
        X.stack.push({
          class: 'net.nanopay.ui.TransferView',
          type: 'regular',
          invoice: self.data
        });
      }
    },
    {
      name: 'payNowDropDown',
      label: '',
      code: function(X) {
        var self = this;
        var invoice = X.data.data;

        self.payNowPopUp_ = self.PopupView.create({
          width: 165,
          x: - 137,
          y: 40
        });
        self.payNowPopUp_.addClass('popUpDropDown')
         .start('div').add('Schedule A Payment')
           .on('click', this.schedulePopUp)
         .end()
          .start().show(invoice.createdBy == this.user.id)
            .add('Void')
            .on('click', this.voidPopUp)
          .end();

        self.payNowMenuBtn_.add(self.payNowPopUp_);
      }
    }
  ],

  listeners: [
    function voidPopUp() {
      var self = this;
      self.payNowPopUp_.remove();
      if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
        this.notify(`${this.verbTenseMsg} ${this.data.paymentMethod.label}.`, '', this.LogLevel.ERROR, true);
        return;
      }
      this.ctrl.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.DisputeModal',
        invoice: this.data
      }));
    },

    function schedulePopUp() {
      var self = this;
      self.payNowPopUp_.remove();
      if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
        this.notify(`${this.verbTenseMsg} ${this.data.paymentMethod.label}.`, '', this.LogLevel.ERROR, true);
        return;
      }
      this.ctrl.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.ScheduleModal',
        invoice: this.data
      }));
    }
  ]
});
