foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.form',
  name: 'BankInfoForm',
  extends: 'foam.u2.Controller',

  documentation: '',

  imports: [
    'errors',
    'goNext',
    'viewData'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ .col {
          display: inline-block;
          width: 250px;
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
          width: 218px;
          height: 44px;
          border-radius: 0;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding: 0 15px;
          border: solid 1px rgba(164, 179, 184, 0.5);
          background-color: white;
          outline: none;
        }

        ^ input {
          width: 218px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
        }

        ^ .guideRow {
          margin-top: 48px;
        }

        ^ .foam-u2-tag-Select:hover {
          cursor: pointer;
        }

        ^ .foam-u2-tag-Select:focus {
          border: solid 1px #59A5D5;
        }

        ^ .caret {
          position: relative;
        }

        .caret:before {
          content: '';
          position: absolute;
          top: -24px;
          left: 190px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }

        .caret:after {
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

        ^ .inputErrorLabel {
          color: #d81e05;
        }`
    })
  ],

  messages: [
      { name: 'Step',                 message: 'Step 1: Please provide your bank account information below.' },
      { name: 'Instructions',         message: 'Give your bank account a name to manage multiple accounts. Don\'t worry, you can always change the name later.' },
      { name: 'LabelName',            message: 'Name *' },
      { name: 'ErrorName',            message: 'Invalid name used.' },
      { name: 'Guide',                message: 'Don\'t know where to find these numbers? Check your cheque or contact your bank representative.' },
      { name: 'LabelAccount',         message: 'Account No. *' },
      { name: 'ErrorAccount',         message: 'Invalid account number used.' },
      { name: 'LabelInstitution',     message: 'Institution *' },
      { name: 'ErrorInstitution',     message: 'Institution number incomplete.' },
      { name: 'LabelTransit',         message: 'Transit No. *' },
      { name: 'ErrorTransit',         message: 'Invalid transit number used.' },
      { name: 'LabelInstitute',       message: 'Institution No. *' },
      { name: 'ErrorInstitute',       message: 'No institute selected' },
      { name: 'LabelInstituteOther',  message: 'Institution No. (Other) *' },
      { name: 'ErrorInstituteOther',  message: 'Invalid institute number used.' }
    ],

    properties: [
      {
        class: 'String',
        name: 'bankName',
        postSet: function(oldValue, newValue) {
          this.viewData.bankName = newValue;
        },
        validateObj: function(bankName) {
          if ( bankName.trim().length == 0 ) return this.ErrorName;
        }
      },
      {
        class: 'String',
        name: 'accountNumber',
        postSet: function(oldValue, newValue) {
          this.viewData.accountNumber = newValue;
        },
        validateObj: function(accountNumber) {
          if ( ! /^[0-9]{1,35}$/.exec(accountNumber) ) return this.ErrorAccount;
        }
      },
      {
        class: 'String',
        name: 'transitNumber',
        postSet: function(oldValue, newValue) {
          this.viewData.transitNumber = newValue;
        },
        validateObj: function(transitNumber) {
          if ( ! /^[0-9]{5}$/.exec(transitNumber) ) return this.ErrorTransit;
        }
      },
      {
        name: 'institution',
        view: {
          class: 'foam.u2.view.ChoiceView',
          choices: [
            'BMO - 001',
            'ScotiaBank - 002',
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
          this.viewData.institution = '001';
          return 'BMO - 001'
        },
        postSet: function(oldValue, newValue) {
          this.hideOther = true;
          switch(newValue) {
            case 'BMO - 001' :
              this.viewData.institution = '001';
              break;
            case 'ScotiaBank - 002' :
              this.viewData.institution = '002';
              break;
            case 'RBC - 003' :
              this.viewData.institution = '003';
              break;
            case 'TD - 004' :
              this.viewData.institution = '004';
              break;
            case 'National Bank of Canada - 005' :
              this.viewData.institution = '005';
              break;
            case 'CIBC - 010' :
              this.viewData.institution = '010';
              break;
            case 'HSBC - 016' :
              this.viewData.institution = '016';
              break;
            case 'Bank of Canada - 177' :
              this.viewData.institution = '177';
              break;
            case 'Citibank Canada - 260' :
              this.viewData.institution = '260';
              break;
            case 'Citizens Bank of Canada - 309' :
              this.viewData.institution = '309';
              break;
            case 'ING Bank of Canada - 614' :
              this.viewData.institution = '614';
              break;
            case 'Other' :
              this.viewData.institution = '';
              this.hideOther = false;
              break;
          }
        },
        validateObj: function(institution, institutionOther) {
          if ( institution == 'Other' && ! institutionOther.trim() )
            return this.ErrorInstitution;
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
          this.viewData.institutionOther = newValue;
        },
        validateObj: function(institution, institutionOther) {
          if ( ! /^[0-9]{3}$/.exec(institutionOther) &&  institution == 'Other') return this.ErrorInstituteOther;
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
          .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions).end()
          .start('div').addClass('row')
            .start('p').addClass('inputFieldLabel').add(this.LabelName).end()
            .start('p')
              .addClass('pDefault')
              .addClass('inputErrorLabel')
              .add(this.slot(this.BANK_NAME.validateObj))
            .end()
          .end()
          .tag(this.BANK_NAME, {onKey: true})
          .start('div').addClass('row')
            .start('p').addClass('pDefault').add(this.Guide).end()
          .end()
          .start('div').addClass('row').addClass('rowTopMarginOverride')
            .start('div').addClass('col')
              .start('div').addClass('row')
                .start('p').addClass('inputFieldLabel').add(this.LabelAccount).end()
                .start('p')
                  .addClass('pDefault')
                  .addClass('inputErrorLabel')
                  .add(this.slot(this.ACCOUNT_NUMBER.validateObj))
                .end()
              .end()
              .tag(this.ACCOUNT_NUMBER, {onKey: true, maxLength: 35})
              .start('div').addClass('row')
                .start('p').addClass('inputFieldLabel').add(this.LabelInstitution).end()
              .end()
              .start('div').addClass('institutionContainer')
                .tag(this.INSTITUTION)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start('div').addClass('col')
              .start('div').addClass('row')
                .start('p').addClass('inputFieldLabel').add(this.LabelTransit).end()
                .start('p')
                  .addClass('pDefault')
                  .addClass('inputErrorLabel')
                  .add(this.slot(this.TRANSIT_NUMBER.validateObj))
                .end()
              .end()
              .tag(this.TRANSIT_NUMBER, {onKey: true, maxLength: 5})
              .start('div').enableClass('institutionContainerHidden', this.hideOther$)
                .start('div').addClass('row')
                  .start('p').addClass('inputFieldLabel').add(this.LabelInstituteOther).end()
                  .start('p')
                    .addClass('pDefault')
                    .addClass('inputErrorLabel')
                    .add(this.slot(this.INSTITUTION_OTHER.validateObj))
                  .end()
                .end()
                .tag(this.INSTITUTION_OTHER, {onKey: true, maxLength: 3})
              .end()
            .end()
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
