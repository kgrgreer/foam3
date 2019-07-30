foam.CLASS({
  package: 'net.nanopay.ui.transfer',
  name: 'TransferComplete',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Interac transfer completion and loading screen.',

  imports: [
    'addCommas',
    'complete'
  ],

  css: `
    ^ {
      height: 355px;
    }
    ^ p{
      width: 464px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ h3{
      font-family: Roboto;
      font-size: 12px;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ h2{
      width: 600px;
      font-size: 14px;
      letter-spacing: 0.4px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^status-check p {
      display: inline-block;
      margin-left: 10px;
      font-size: 12px;
      letter-spacing: 0.2px;
      color: grey;
      margin-top: 5px;
    }
    ^status-check img {
      position: relative;
      top: 5;
      display: none;
    }
    ^status-check-container{
      margin-top: 35px;
      margin-bottom: 35px;
    }
    ^ .show-green{
      color: #2cab70;
    }
    ^status-check-container{
      height: 170px;
    }
    ^status-check{
      height: 32px;
    }
    ^ .show{
      display: inline-block;
    }
    ^ .hide{
      display: none;
    }
    ^ .show-yes{
      display: inline-block;
    }
    ^ .foam-u2-ActionView-exportButton{
      position: relative;
      top: -55px;
      float: none;
    }
  `,

  properties: [
    {
      name: 'time',
      value: 0,
      validateObj: function(time) {
        if ( time <= 5 ) return 'Transaction sending...';
      }
    },
    'name'
  ],

  methods: [
    function init() {
      this.tick();
      this.SUPER();

      var self = this;

      this.name = this.viewData.payeeCard.firstName + ' ' + this.viewData.payeeCard.lastName;
      if ( this.invoiceMode ) {
        // if organization exists, change name to organization name.
        if ( this.viewData.payeeCard.organization ) {
          this.name = this.viewData.payeeCard.organization;
        }
      }

      this
        .addClass(this.myClass())
        .start('h2').add('Submitting Payment...').addClass('show').enableClass('hide', this.time$.map(function(value) { return value > 5; })).end()
        .start().addClass('hide').enableClass('show-yes', this.time$.map(function(value) { return value > 3; }) )
          .start('h2').add(this.name, ' has received CAD ', this.addCommas((this.viewData.fromAmount/100).toFixed(2)), '.').end()
          .start('h3').add('Transaction ID ', this.viewData.transaction? this.viewData.transaction.id : '').end()
          .start()
            .start('p')
              .add('The transaction is successfully finished, you can check the status of the payment from home screen at any time.')
            .end()
          .end()
        .end()
        .start(this.EXPORT_BUTTON).addClass('import-button').addClass('hide').enableClass('show-yes', this.time$.map(function(value) { return value > 5 }) ).end()
        .start().addClass(this.myClass('status-check-container'))
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function(value) { return value > 0 }))
            .start('p').add('Payment Request Submitted...').enableClass('show-green', this.time$.map(function(value) { return value > 0; })).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      icon: 'images/ic-export.png',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({ class: 'net.nanopay.ui.modal.ExportModal', exportObj: X.viewData.transaction }));
      }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 400,
      code: function() {
        this.time += 1;
        this.tick();
      }
    }
  ]
});
