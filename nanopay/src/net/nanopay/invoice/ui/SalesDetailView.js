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
  name: 'SalesDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'ctrl',
    'hideSummary',
    'invoiceDAO',
    'notify',
    'stack',
    'user'
  ],

  exports: [
    'as data',
    'hideSummary',
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
    ^ .foam-u2-ActionView-recordPayment:hover {
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-voidDropDown:focus {
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-voidDropDown:hover {
      background: /*%PRIMARY2%*/ #144794;
    }
    ^ .foam-u2-ActionView-recordPayment {
      background-color: #59A5D5;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .foam-u2-ActionView-voidDropDown {
      width: 30px;
      height: 40px;
      background-color: #59A5D5;
      float: right;
    }
    ^ .foam-u2-ActionView-voidDropDown::after {
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
      z-index: 100;
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
    ^ .noteMargin {
      margin-bottom: 0px; 
      margin-left: 20px; 
    }
    ^ .noteFont {
      font-size: 10px;
    }
  `,

  properties: [
    'voidMenuBtn_',
    'voidPopUp_',
    {
      name: 'verbTenseMsg',
      documentation: 'Past or present message on invoice status notification',
      expression: function(data) {
        return data.paymentMethod === this.PaymentStatus.PROCESSING ?
            'Invoice is' :
            'Invoice has been';
      }
    },
    {
      name: 'foreignExchange',
      factory: function() {
        if ( this.data.sourceCurrency == null ) return false;
        return this.data.destinationCurrency !== this.data.sourceCurrency;
      }
    }
  ],

  messages: [
    { name: 'name', message: 'Note: ' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideSummary = true;
      let showVoid = ( ! foam.util.equals(self.data.status, self.InvoiceStatus.VOID) ) &&
                   self.data.createdBy === self.user.id;
      let showRejected = ( ! foam.util.equals(self.data.status, self.InvoiceStatus.REJECTED) ) &&
                   self.data.createdBy === self.user.id;
      let showRecPay = ( ! foam.util.equals(self.data.status, self.InvoiceStatus.VOID) );

      this.addClass(self.myClass())
        .start(self.VOID_DROP_DOWN, null, self.voidMenuBtn_$).show(showVoid).end()
        .start(self.RECORD_PAYMENT).show(showRecPay).end();

      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .tag(this.BACK_ACTION)
        .endContext()
        .tag(this.EXPORT_BUTTON)
        .start('h5')
          .add('Bill to ', this.data.payer.toSummary())
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
      .start().addClass('light-roboto-h2')
        .start('span').addClass('noteMargin').add(this.name).end()
        .start('span').addClass('noteFont').add(this.data.note).end()
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
      name: 'recordPayment',
      label: 'Record Payment',
      code: function(X) {
        var self = this;
        if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
          X.notify(`${this.verbTenseMsg} ${this.data.paymentMethod.label}.`, '', self.LogLevel.ERROR, true);
          return;
        }
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
          invoice: this.data
        }));
      }
    },
    {
      name: 'voidDropDown',
      label: '',
      code: function(X) {
         var self = this;

         self.voidPopUp_ = self.PopupView.create({
           width: 165,
           x: - 137,
           y: 40,
         });

         self.voidPopUp_.addClass('popUpDropDown')
          .start('div').add('Void')
            .on('click', this.voidPopUp)
          .end();

        self.voidMenuBtn_.add(self.voidPopUp_);
      }
    }
  ],

  listeners: [
    function voidPopUp() {
      var self = this;
      self.voidPopUp_.remove();
      if ( this.data.paymentMethod != this.PaymentStatus.NONE ) {
        X.notify(`${this.verbTenseMsg} ${this.data.paymentMethod.label}.`, '', self.LogLevel.ERROR, true);
        return;
      }
      this.ctrl.add(this.Popup.create().tag({
        class: 'net.nanopay.invoice.ui.modal.DisputeModal',
        invoice: this.data
      }));
    }
  ]
});
