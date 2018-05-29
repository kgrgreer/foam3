foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankVerificationForm',
  extends: 'foam.u2.Controller',

  documentation: 'Page to input verification amount that was deposited into the user\'s bank account provided.',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext',
    'verifyAmount'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .zeroLabel {
          display: inline-block;
          font-size: 30px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          color: #093649;
          position: relative;
          top: 6px;
        }

        ^ .property-tenthcent {
          height: 30px;
          outline: none;
          padding-left: 5px;
        }

        ^ .property-cent {
          height: 30px;
          outline: none;
          padding-left: 5px;
        }

        ^ .inputErrorLabel {
          margin-left: 0;
        }

        ^ .amountSpacing .foam-u2-TextField{
          margin-left: 23px;
          font-size: 30px;
          text-align: center;
        }

        ^ .foam-u2-TextField {
          display: inline-block;
          width: 50px;
          height: 60px;
        }

        ^ input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        ^ .property-cent{
          background: none;
          border: none;
          font-size: 30px;
          font-weight: 300;
          position: relative;
          margin-left: 5px;
          font-family: 'Roboto', sans-serif;
          top: 5px;
          width: 25px;
          border-bottom: 2px solid black;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step',           message: 'Step 2: Please verify your bank account.' },
    { name: 'Instructions1',  message: 'We have debited and credited an amount between $0.01 - $0.99 to the account you have provided. The amount will appear in your account 2-3 business days from the account creation date.' },
    { name: 'Instructions2',  message: 'Please input the amount below to verify your account.' }
  ],

  properties: [
    {
      class: 'Double',
      name: 'amount',
      value: 0.00,
      postSet: function(oldValue, newValue) {
        this.viewData.verificationAmount = newValue;
      },
      validateObj: function(amount, tenthCent, cent) {
        amount = parseInt(Math.round(amount * 100));
        this.verifyAmount = amount;
      }
    },
    {
      class: 'Int',
      name: 'tenthCent',
      min: 0,
      max: 9,
      preSet: function(oldValue, newValue) {
        if ( newValue > 9 ) return oldValue;
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        var value = newValue / 10;
        this.amount = value + ( this.cent / 100 || 0 );
      }
    },
    {
      class: 'Int',
      name: 'cent',
      min: 0,
      max: 9,
      preSet: function(oldValue, newValue) {
        if ( newValue > 9 ) return oldValue;
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        var value = newValue / 100;
        this.amount = value + ( this.tenthCent / 10 || 0 );
      }
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions1)
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions2)
        .start('div').addClass('row').addClass('amountSpacing')
          .start('p').addClass('zeroLabel').add('0.').end()
          .start(this.TENTH_CENT, {onKey: true, maxLength: 1}).addClass('property-cent').end()
          .start(this.CENT, {onKey: true, maxLength: 1}).end()
        .end()
        .start('p')
          .addClass('pDefault')
          .addClass('inputErrorLabel')
          .add(this.slot(this.AMOUNT.validateObj))
        .end()
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
})
