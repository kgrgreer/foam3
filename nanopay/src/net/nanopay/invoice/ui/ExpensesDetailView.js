foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.BankAccount'
  ],

  imports: [
    'stack',
    'hideSaleSummary',
    'invoiceDAO',
    'ctrl',
    'bankAccountDAO',
    'user'
  ],

  exports: [
    'as data',
    'openExportModal'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

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
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-exportButton {
      position: absolute;
      width: 75px;
      height: 40px;
      opacity: 0.01;
      cursor: pointer;
      z-index: 100;
    }
    ^ .net-nanopay-ui-ActionView-payNow {
      background-color: #59A5D5;
      border: solid 1px #59A5D5;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    ^ .net-nanopay-ui-ActionView-payNowDropDown {
      width: 30px;
      height: 40px;
      background-color: #59A5D5;
      border: solid 1px #59A5D5;
      float: right;
    }
    ^ .net-nanopay-ui-ActionView-payNowDropDown::after {
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
    'payNowMenuBtn_',
    'payNowPopUp_'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideSaleSummary = true;     
      this
        .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .start(this.PAY_NOW_DROP_DOWN, null, this.payNowMenuBtn_$).end()
        .start(this.PAY_NOW).end()
        .start({ class: 'net.nanopay.ui.ActionButton', data: { image: 'images/ic-export.png', text: 'Export' } }).add(this.EXPORT_BUTTON).style({ 'float': 'right' }).end()
        .start('h5').add('Invoice from ', this.data.payeeName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
        .start('h2').addClass('light-roboto-h2').style({ "margin-bottom": "0px"})
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
        X.stack.push({ class: 'net.nanopay.invoice.ui.ExpensesView'});
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
      name: 'payNow',
      label: 'Pay Now',
      code: function (X) {
        var self = this;
        if(this.data.paymentMethod.name != 'NONE' || this.data.status == 'Paid'){
          this.add(self.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
          return;
        }

        this.bankAccountDAO.where(this.AND(this.EQ(this.BankAccount.STATUS, 'Verified'), this.EQ(this.BankAccount.OWNER, this.user.id))).limit(1).select().then(function(account) {
          if ( account.array.length === 0 ) {
            self.add(self.NotificationMessage.create({ message: 'Requires a verified bank account.', type: 'error' }));
            return;
          }
          X.stack.push({ class: 'net.nanopay.ui.transfer.TransferWizard', type: 'regular', invoice: self.data });
        }).catch(function (err) {
          console.error(err);
          self.add(self.NotificationMessage.create({ message: 'Could not continue. Please contact customer support.', type: 'error' }));
        });
      }
    },
    {
      name: 'payNowDropDown',
      label: '',
      code: function (X) {
        var self = this;
        var invoice = X.data.data;

        self.payNowPopUp_ = self.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        })
        self.payNowPopUp_.addClass('popUpDropDown')
         .start('div').add('Schedule A Payment')
           .on('click', this.schedulePopUp)
         .end()
          .start().show(invoice.createdBy == this.user.id)
            .add('Void')
            .on('click', this.voidPopUp)
          .end()

        self.payNowMenuBtn_.add(self.payNowPopUp_)
      }
    }
  ],

  listeners: [
    function voidPopUp(){
      var self = this;
      self.payNowPopUp_.remove();
      if(this.data.paymentMethod.name != 'NONE'){
        self.add(self.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal', invoice: this.data }));
    },

   function schedulePopUp(){
     var self = this;
     self.payNowPopUp_.remove();
     if(this.data.paymentMethod.name != 'NONE'){
       self.add(self.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
       return;
     }
     this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.ScheduleModal', invoice: this.data }));
   }
  ]
});
