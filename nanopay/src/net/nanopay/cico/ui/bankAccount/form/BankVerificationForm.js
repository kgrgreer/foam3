foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankVerificationForm',
  extends: 'foam.u2.Controller',

  documentation: 'Page to input verification amount that was deposited into the user\'s bank account provided.',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
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
      */}
    })
  ],

  messages: [
    { name: 'Step',           message: 'Step 2: Please verify your bank account.' },
    { name: 'Instructions1',  message: 'We have deposited an amount between $0.01-0.99 to the acccount you have provided. In 2-3 business days, your account should display the amount.' },
    { name: 'Instructions2',  message: 'Please input the right amount below. Once you have input the right amount, your account will be verified.' }
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
        if ( amount == 0.00 ) return 'Please enter an amount.';
        if ( amount > 1.00 || amount < 0.01 ) return 'Do not put more than 1 number in a single field.';
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
          .start('p').addClass('pDefault').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions1)
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions2)
        .start('div').addClass('row').addClass('amountSpacing')
          .start('p').addClass('zeroLabel').add('0.').end()
          .tag(this.TENTH_CENT, {onKey: true, maxLength: 1})
          .tag(this.CENT, {onKey: true, maxLength: 1})
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
