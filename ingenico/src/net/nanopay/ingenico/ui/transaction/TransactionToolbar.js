foam.CLASS({
  package: 'net.nanopay.ingenico.ui.transaction',
  name: 'TransactionToolbar',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 55px;
          background-color: #2c4389;
        }
        ^ .transaction-toolbar-icon-wrapper {
          width: 30px;
          height: 30px;
          padding-left: 20px;
          padding-top: 13px;
          padding-bottom: 12px;
          float: left;
        }
        ^ .transaction-toolbar-icon {
          width: 50%;
          margin: 0 auto;
          padding-top: 4px;
          padding-bottom: 3px;
        }
        ^ .transaction-toolbar-icon img {
          width: 13.5px;
          height: 23px;
          object-fit: contain;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('transaction-toolbar-icon-wrapper')
          .start('div').addClass('transaction-toolbar-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-arrow-left.png '})
          .end()
          .on('click', this.onBackClicked)
        .end()
    }
  ],

  listeners: [
    function onBackClicked (e) {
      this.stack.back();
    }
  ]
});