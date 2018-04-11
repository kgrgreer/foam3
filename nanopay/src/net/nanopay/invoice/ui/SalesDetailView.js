foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SalesDetailView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'stack',
    'hideReceivableSummary',
    'invoiceDAO',
    'user',
    'ctrl'
  ],

  exports: [
    'as data',
    'hideReceivableSummary',
    'openExportModal'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  constants: {
    RECORDED_PAYMENT: -2
  },

  css: `
    ^ {
      width: 962px;
    }
    ^ h5{
      opacity: 0.6;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: #093649;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border: 1px solid lightgrey;
      background-color: rgba(164, 179, 184, 0.1);
      vertical-align: top;
      position: relative;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-recordPayment {
      background-color: #59A5D5;
      border: solid 1px #59A5D5;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown {
      width: 30px;
      height: 40px;
      background-color: #59A5D5;
      border: solid 1px #59A5D5;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-voidDropDown::after {
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
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
  `,

  properties: [
    'voidMenuBtn_',
    'voidPopUp_'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideReceivableSummary = true;

      this
        .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .callIf(this.data.createdBy == this.user.id, function(){
          this.start(this.VOID_DROP_DOWN, null, this.voidMenuBtn_$).end()
        })
        .start(this.RECORD_PAYMENT).end()
        .start(this.EXPORT_BUTTON, { icon: 'images/ic-export.png', showLabel:true }).end()
        .start('h5').add('Bill to ', this.data.payerName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
        .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Note:')
        .end()
        .start('br').end()
        .start('h2').addClass('light-roboto-h2').style({ 'font-size': '14px'})
          .add(this.data.note)
        .end();
    },

    function openExportModal() {
      this.add(this.Popup.create().tag({ class: 'net.nanopay.ui.modal.ExportModal', exportObj: this.data }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SalesView' });
      }
    },
    {
      name: 'exportButton',
      label: 'Export',
      code: function(X) {
        X.openExportModal();
      }
    },
    {
      name: 'recordPayment',
      label: 'Record Payment',
      code: function(X) {
        var self = this;
        if(this.data.paymentMethod.name != "NONE" || this.data.paymentId != this.RECORDED_PAYMENT && this.data.paymentDate < Date.now() ){
          self.add(self.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
          return;
        }
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal', invoice: this.data }));
      }
    },
    {
      name: 'voidDropDown',
      label: '',
      code: function(X) {
         var self = this;

         self.voidPopUp_ = self.PopupView.create({
           width: 165,
           x: -137,
           y: 40,
         })
         self.voidPopUp_.addClass('popUpDropDown')
          .start('div').add('Void')
            .on('click', this.voidPopUp)
          .end()
        self.voidMenuBtn_.add(self.voidPopUp_)
      }
    }
  ],

  listeners: [
    function voidPopUp() {
      var self = this;
      self.voidPopUp_.remove();
      if(this.data.paymentMethod.name != "NONE"){
        self.add(self.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal', invoice: this.data }));
    }
  ]
});
