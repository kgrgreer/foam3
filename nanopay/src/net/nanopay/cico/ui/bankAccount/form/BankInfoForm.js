foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input bank account details.',

  imports: [
    'goBack',
    'goNext',
    'viewData'
  ],

  css: `
    ^ .col {
      display: inline-block;
      width: 357px;

      vertical-align: top;
    }

    ^ .colSpacer {
      margin-left: 30px;
    }

    ^ input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    ^ .foam-u2-tag-Select {
      width: 209px;
      height: 40px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 0 15px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none;
    }

    ^ .institutionContainer {
      position: relative;
    }

    ^ .foam-u2-tag-Select:hover {
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField {
      outline: none;
      height: 40px;
      padding: 10px;
    }

    ^ .instituteOtherMargin {
      margin-left: 150px;
    }
  `,

  messages: [
    { name: 'Guide',                message: 'Don\'t know where to find these numbers? Check your cheque or contact your bank representative.' },
    { name: 'Instructions',         message: 'Give your bank account a name to manage multiple accounts. Don\'t worry, you can always change the name later.' },
    { name: 'LabelAccount',         message: 'Account No. *' },
    { name: 'LabelInstitute',       message: 'Institution No. *' },
    { name: 'LabelInstituteOther',  message: 'Institution No. (Other) *' },
    { name: 'LabelInstitution',     message: 'Institution *' },
    { name: 'LabelName',            message: 'Name *' },
    { name: 'LabelTransit',         message: 'Transit No. *' },
    { name: 'Step',                 message: 'Step 1: Please provide your bank account information below.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'bankName',
      postSet: function(oldValue, newValue) {
        this.viewData.accountName = newValue;
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.accountNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.transitNumber = newValue;
      }
    },
    {
      name: 'institution',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Other'
        ],
      },
      postSet: function(oldValue, newValue) {
        this.viewData.bankNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'institutionOther',
      postSet: function(oldValue, newValue) {
        this.viewData.bankNumber = newValue;
      },
      validateObj: function(institution, institutionOther) {
        if ( ! /^[0-9]{3}$/.exec(institutionOther)) return;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions).end()
        .start('div').addClass('row')
          .start('p').addClass('inputFieldLabel').add(this.LabelName).end()
        .end()
        .tag(this.BANK_NAME, {onKey: true})
        .start('div').addClass('row')
          .start('p').addClass('pDefault').add(this.Guide).end()
        .end()
        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('div').addClass('col')
            .start('div').addClass('row')
              .start('p').addClass('inputFieldLabel').add(this.LabelAccount).end()
            .end()
            .tag(this.ACCOUNT_NUMBER, {onKey: true, maxLength: 35})
          .end()
          .start('div').addClass('col')
            .start('div').addClass('row')
              .start('p').addClass('inputFieldLabel').add(this.LabelTransit).end()
            .end()
            .tag(this.TRANSIT_NUMBER, {onKey: true, maxLength: 5})
          .end()
          .start().addClass('inline')
            .start('p').add(this.LabelInstitution).addClass('inputFieldLabel').end()
            .start(this.INSTITUTION).end()
          .end()
          .start().addClass('inline instituteOtherMargin')
            .start('p').add(this.LabelInstituteOther).addClass('inputFieldLabel').end()
            .start(this.INSTITUTION_OTHER, {onKey: true, maxLength: 3}).end()
          .end()
        .end()
    }
  ]
});
