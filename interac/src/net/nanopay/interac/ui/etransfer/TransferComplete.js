foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferComplete',
  extends: 'net.nanopay.interac.ui.etransfer.TransferView',

  documentation: 'Interac transfer completion and loading screen.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ p{
          width: 464px;
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.45;
          letter-spacing: 0.3px;
          color: #093649;
        }
        ^ h3{
          font-family: Roboto;
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^ h2{
          width: 300px;
          font-size: 14px;
          letter-spacing: 0.4px;
          color: #093649;
        }
        ^ 
      */}
    })
  ],

  methods: [
    function init() {
      
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().style({ display: 'inline-block'})
          .start('h2').add('360 Design has received CAD 200.00.').end()
          .start('h3').add('Reference No. CAxxx723').end()
          .start()
            .start('p')
              .add('The transaction is successfully finished, you can check the status of the payment from home screen at any time.')
            .end()
          .end()
        .end()
        .start().style({ float: 'right'})
          .start({class: 'net.nanopay.retail.ui.shared.ActionButton', data: {image: 'images/ic-export.png', text: 'Export'}}).addClass('import-button').end()
        .end()
    }
  ]
});
