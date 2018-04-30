foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksBankPadAuthorization',
  extends: 'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',

  css: `
    ^ .net-nanopay-ui-ActionView-nextButton {
      margin-left: 264px;
      box-sizing: border-box;
      background-color: #59a5d5;
      outline: none;
      border:none;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      color: #FFFFFF;
    }

    ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .net-nanopay-ui-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-left: 1px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.
      addClass(this.myClass())
      .start('div').style({'margin-top' : '15px', 'height' : '40px'})
        .tag(this.CLOSE_BUTTON)
        .tag(this.NEXT_BUTTON)
      .end()
    }
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'I Agree',
      code: function(X) {
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'Back',
      code: function(X) {
        //console.log('close the form');
        X.form.goBack();
      }
    }
  ]
});
