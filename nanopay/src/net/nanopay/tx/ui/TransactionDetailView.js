foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  documentation: 'Transaction detail view.',

  properties: [
    'data'
  ],

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
    ^ .net-nanopay-tx-ui-SingleItemView{
      margin-top: 25px;
    }
    ^ .net-nanopay-ui-ActionView-backAction{
      border-radius: 2px;
      border: 1px solid lightgrey;
      background-color: rgba(164, 179, 184, 0.1);
    }
    ^ .net-nanopay-ui-ActionView-exportButton{
      position: absolute;
      opacity: 0.01;
    }
    ^ .inline{
      float: right;
      margin-right: 30px;
    }
  `,

  methods:[
    function initE(){

      this
      .addClass(this.myClass())
      .start(this.BACK_ACTION).end()
      .start().addClass('inline')
        .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-export.png', text: 'Export', data: this.data}}).add(this.EXPORT_BUTTON).end()
      .end()  
      .tag({ class: 'net.nanopay.tx.ui.SingleItemView', data: this.data })
      .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Note:')
      .end()
      .start('br').end()
      .start('h2').addClass('light-roboto-h2').style({ 'font-size': '14px'})
        .add(this.data.notes)
      .end();
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.back();
      }
    },
    {
      name: 'exportButton',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.ExportModal', exportObj: X.data.data }));
      }
    }
  ]
});