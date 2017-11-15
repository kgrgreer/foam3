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
          height: 56px;
          background-color: #2c4389;
          -webkit-box-shadow: none;
          box-shadow: none;
        }
        ^ .transaction-toolbar-icon {
          height: 100%;
          padding-left: 20px;
          padding-right: 20px;
          float: left;
        }
        ^ .transaction-toolbar-title {
          font-size: 16px;
          line-height: 56px;
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
        .start('button').addClass('transaction-toolbar-icon material-icons')
          .add('arrow_back')
          .on('click', this.onBackClicked)
        .end()
        .start('div').addClass('transaction-toolbar-title').add('Back').end()
    }
  ],

  listeners: [
    function onBackClicked (e) {
      this.stack.back();
    }
  ]
});