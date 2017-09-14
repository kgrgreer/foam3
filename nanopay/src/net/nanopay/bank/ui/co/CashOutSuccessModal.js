foam.CLASS({
  package: 'net.nanopay.bank.ui.co',
  name: 'CashOutSuccessModal',
  extends: 'foam.u2.View',

  imports: [ 'closeDialog' ],

  documentation: 'Pop up modal displaying details of a successful cash out.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          height: 288px;
          margin: auto;
        }
        ^ .cashOutContainer {
          width: 448px;
          height: 288px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
        }
        ^ .popUpHeader {
          width: 448px;
          height: 40px;
          background-color: #093649;
        }
        ^ .popUpTitle {
          width: 198px;
          height: 40px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 40.5px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #ffffff;
          margin-left: 20px;
          display: inline-block;
        }
        ^ .successIcon {
          width: 60px;
          height: 60px;
          display: inline-block;
          margin-left: 30px;
          padding: 0;
          vertical-align: top;
          margin-top: 20px;
        }
        ^ .cashOutResultDiv {
          margin-top: 34px;
          display: inline-block;
          width: 301px;
        }
        ^ .cashOutResult {
          font-family: Roboto;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
        }
        ^ .foam-u2-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 5px;
          margin-right: 20px;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        ^ .foam-u2-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
    */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start().addClass('cashOutContainer')
          .start().addClass('popUpHeader')
            .start().add(this.Title).addClass('popUpTitle').end()
            .add(this.CLOSE_BUTTON)
          .end()
          .start({class: 'foam.u2.tag.Image', data: 'ui/images/done-30.png'}).addClass('successIcon').end()
          .start('div').addClass('cashOutResultDiv')
            .start().add(this.CashOutSuccessDesc).addClass('cashOutResult').end()
            .br()
            .start().add(this.CashOutResultDesc).addClass('cashOutResult').end()
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash Out' },
    { name: 'CashOutSuccessDesc', message: 'You have successfully cashed out $0.00 to Scotiabank Chequing.'},
    { 
      name: 'CashOutResultDesc', 
      message: "Please be advised that it will take around 2 business days for the balance to arrive in your bank account. If you don't see your balance after 5 business days please contact our advisor at XXX-XXX-XXXX."
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
})