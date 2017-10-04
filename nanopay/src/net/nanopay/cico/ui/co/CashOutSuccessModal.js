foam.CLASS({
  package: 'net.nanopay.cico.ui.co',
  name: 'CashOutSuccessModal',
  extends: 'foam.u2.Controller',

  requires: [ 'net.nanopay.cico.ui.CicoView' ],

  imports: [ 'closeDialog', 'amount' ],

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
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
          display: inline-block;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 7px;
          margin-right: 20px;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
        ^ .property-amount {
          width: 100px;
          height: 16px;
          display: inline-block;
          padding: 0;
          margin: 0;
          margin-left: 5px;
          margin-bottom: 20px;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.3px;
          color: #093649;
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
          .start({class: 'foam.u2.tag.Image', data: 'images/done-30.svg'}).addClass('successIcon').end()
          .start('div').addClass('cashOutResultDiv')
            .start().add(this.CashOutSuccessDesc).addClass('cashOutResult').end()
            .tag(this.CicoView.AMOUNT, { mode: foam.u2.DisplayMode.RO })
            .br()
            .start().add(this.CashOutResultDesc).addClass('cashOutResult').end()
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash Out' },
    { name: 'CashOutSuccessDesc', message: 'You have successfully cashed out ' },
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
});