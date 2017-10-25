foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
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
          height: 56px;
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
        ^ .transaction-toolbar-title {
          height: 30px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-left: 20px;
          padding-top: 12px;
          padding-bottom: 13px;
          float: left;
        }
      */}
    })
  ],

  properties: [
    { name: 'title', class: 'String', value: 'Back' }
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
        .start('div').addClass('transaction-toolbar-title')
          .add(this.title)
        .end()
    }
  ],

  listeners: [
    function onBackClicked (e) {
      this.stack.back();
    }
  ]
});