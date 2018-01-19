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

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
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
          width: 302px;
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

        ^ .caret {
          position: relative;
        }

        ^ .caret:before {
          content: '';
          position: absolute;
          top: -22px;
          left: 272px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }

        ^ .caret:after {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          border-top: 0px solid #ffffff;
          border-left: 0px solid transparent;
          border-right: 0px solid transparent;
        }

        ^ .institutionContainerHidden {
          display: none;
        }

        ^ .instituteOtherMargin {
          margin-left: 56px;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step',                 message: 'Step 1: Please provide your bank account information below.' },
    { name: 'Instructions',         message: 'Give your bank account a name to manage multiple accounts. Don\'t worry, you can always change the name later.' },
    { name: 'LabelName',            message: 'Name *' },
    { name: 'Guide',                message: 'Don\'t know where to find these numbers? Check your cheque or contact your bank representative.' },
    { name: 'LabelAccount',         message: 'Account No. *' },
    { name: 'LabelInstitution',     message: 'Institution *' },
    { name: 'LabelTransit',         message: 'Transit No. *' },
    { name: 'LabelInstitute',       message: 'Institution No. *' },
    { name: 'LabelInstituteOther',  message: 'Institution No. (Other) *' }
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
      // TODO: create a DAO to store these values so they can be more easily extended.
      name: 'institution',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'BMO - 001',
          'Scotiabank - 002',
          'RBC - 003',
          'TD - 004',
          'National Bank of Canada - 005',
          'CIBC - 010',
          'HSBC - 016',
          'Bank of Canada - 177',
          'Citibank Canada - 260',
          'Citizens Bank of Canada - 309',
          'ING Bank of Canada - 614',
          'Other'
        ],
      },
      factory: function() {
        this.viewData.bankNumber = '001';
        return 'BMO - 001'
      },
      postSet: function(oldValue, newValue) {
        this.hideOther = true;
        switch(newValue) {
          case 'BMO - 001' :
            this.viewData.bankNumber = '001';
            break;
          case 'Scotiabank - 002' :
            this.viewData.bankNumber = '002';
            break;
          case 'RBC - 003' :
            this.viewData.bankNumber = '003';
            break;
          case 'TD - 004' :
            this.viewData.bankNumber = '004';
            break;
          case 'National Bank of Canada - 005' :
            this.viewData.bankNumber = '005';
            break;
          case 'CIBC - 010' :
            this.viewData.bankNumber = '010';
            break;
          case 'HSBC - 016' :
            this.viewData.bankNumber = '016';
            break;
          case 'Bank of Canada - 177' :
            this.viewData.bankNumber = '177';
            break;
          case 'Citibank Canada - 260' :
            this.viewData.bankNumber = '260';
            break;
          case 'Citizens Bank of Canada - 309' :
            this.viewData.bankNumber = '309';
            break;
          case 'ING Bank of Canada - 614' :
            this.viewData.bankNumber = '614';
            break;
          case 'Other' :
            this.viewData.bankNumber = '';
            this.hideOther = false;
            break;
        }
      },
      validateObj: function(institution, institutionOther) {
        if ( institution == 'Other' && ! institutionOther.trim() )
          return;
      }
    },
    {
      class: 'Boolean',
      name: 'hideOther',
      value: true
    },
    {
      class: 'String',
      name: 'institutionOther',
      postSet: function(oldValue, newValue) {
        this.viewData.bankNumber = newValue;
      },
      validateObj: function(institution, institutionOther) {
        if ( ! /^[0-9]{3}$/.exec(institutionOther) &&  institution == 'Other') return;
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
            .start('div').addClass('caret').end()
          .end()
          .start().addClass('inline instituteOtherMargin').enableClass('institutionContainerHidden', this.hideOther$)
            .start('p').add(this.LabelInstituteOther).addClass('inputFieldLabel').end()
            .start(this.INSTITUTION_OTHER, {onKey: true, maxLength: 3}).end()
          .end()
        .end()
    }
  ]
});
