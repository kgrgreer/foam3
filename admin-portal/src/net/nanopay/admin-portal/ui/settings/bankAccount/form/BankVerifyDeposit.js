foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.form',
  name: 'BankVerifyDeposit',
  extends: 'foam.u2.Controller',

  documentation: '',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
        }
        ^ .link {
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #2CAB70;
        }
        ^ .cashoutOption {
          display: inline-block;
          width: 466px;
          height: 40px;
          background-color: #FFFFFF;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          color: #093649;
        }
        ^ .cashoutOption:hover {
          cursor: pointer;
          background-color: #F1F1F1;
        }
        ^ .cashoutOption.selected {
          background-color: #23C2B7;
          box-shadow: none;
          color: #FFFFFF;
        }
        ^ .cashoutOptionLabel {
          display: inline;
          margin-left: 60px;
          line-height: 40px;
          font-size: 12px;
          letter-spacing: 0.3px;
        }
        ^ .pricingContainer {
          display: inline;
          float: right;
          width: 100px;
          margin-right: 60px;
        }
        ^ .pricingContainer .cashoutOptionLabel {
          margin-left: 0;
        }
        ^ .autoCashoutLabel {
          font-size: 12px;
          letter-spacing: 0.3px;
          color: #093649;
          margin: 0;
          margin-top: 10px;
        }
        ^ .choiceContainer {
          margin-top: 20px;
        }
        ^ .choiceContainer input[type="radio"],
        ^ .choiceContainer input[type="checkbox"]{
          display: none;
        }
        ^ .foam-u2-RadioContainer label {
          position: relative;
          padding-left: 38px;
        }
        ^ .foam-u2-RadioContainer {
          margin: 11px 0;
        }
        ^ .foam-u2-RadioContainer span::before,
        ^ .foam-u2-RadioContainer span::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          margin: auto;
        }
        ^ .foam-u2-RadioContainer span.foam-u2-Label:hover {
          cursor: pointer;
        }
        ^ .foam-u2-RadioContainer span.foam-u2-Label::before {
          left: 0;
          width: 15px;
          height: 15px;
          border: solid 1px #2d4088;
          border-radius: 7.5px;
          box-sizing: border-box;
        }
        ^ .foam-u2-RadioContainer span.foam-u2-Label::after {
          left: 5px;
          width: 5px;
          height: 5px;
          border-radius: 2.5px;
          background-color: transaparent;
        }
        input[type="radio"]:checked + label span.foam-u2-Label::after {
          background-color: #2d4088;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Verify your account' },
    { name: 'Deposit', message: 'We will deposit an amount between $0.01-0.99 to the account you have provided. Please check back in 2 business days and input the correct number.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.Deposit).end()

    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        var self = this;
        this.errors = this.errors_;
      }
    }
  ]
})
