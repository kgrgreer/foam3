/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankInfoForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input bank account details.',

  requires: [
    'foam.nanos.auth.Address'
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

    ^ .headings {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .messageBody {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .medium-header {
      margin-top: 15px;
      font-weight: 400;
    }

    ^ .net-nanopay-sme-ui-AddressView {
      margin-bottom: 50px;
      margin-top: 15px;
      width: 610px;
    }

    ^ .half-container {
      width: 40%;
    }

    ^ .left-of-container {
      margin-right: 110px;
    }
  `,

  messages: [
    { name: 'Guide', message: 'Don\'t know where to find these numbers? Check your cheque or contact your bank representative.' },
    { name: 'Instructions', message: 'Give your bank account a name to manage multiple accounts.' },
    { name: 'LabelAccount', message: 'Account No. *' },
    { name: 'LabelInstitute', message: 'Institution No. *' },
    { name: 'LabelName', message: 'Name *' },
    { name: 'LabelTransit', message: 'Transit No. *' },
    { name: 'Step', message: 'Step 1: Please provide your bank account information below.' },
    { name: 'TC1', message: 'I authorize nanopay Corporation to withdraw from my (debit)account with the financial institution listed above from time to time for the amount that I specify when processing a one-time ("sporadic") pre-authorized debit.' },
    { name: 'TC2', message: 'I have certain recourse rights if any debit does not comply with this agreement. For example, I have right to receive reimbursement for any debit that is not authorized or is not consistent with the PAD Agreement. To obtain more information on my recourse rights, I may contact my financial institution or visit www.cdnpay.ca.' },
    { name: 'TC3', message: 'This Authorization may be cancelled at any time upon notice being provided by me, either in writing or orally, with proper authorization to verify my identity. I acknowledge that I can obtain a sample cancellation form or further information on my right to cancel this Agreement from nanopay Corporation or by visiting www.cdnpay.ca.' },
    { name: 'Next', message: 'Next' },
    { name: 'Back', message: 'Back' }
  ],

  properties: [
    {
      class: 'String',
      name: 'bankName',
      postSet: function(oldValue, newValue) {
        this.viewData.accountInfo.name = newValue;
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.accountInfo.accountNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      postSet: function(oldValue, newValue) {
        // this is branchId, not the Id of branch obj.
        this.viewData.accountInfo.transitNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'institutionOther',
      postSet: function(oldValue, newValue) {
        this.viewData.accountInfo.institutionNumber = newValue;
      }
    }
  ],

  methods: [
    function init() {
      // this is used to pre-populate when coming back to this view.
      if ( this.viewData.accountInfo ) {
        this.bankName = this.viewData.accountInfo.name;
        this.accountNumber = this.viewData.accountInfo.accountNumber;
        this.transitNumber = this.viewData.accountInfo.transitNumber;
        this.institutionOther = this.viewData.accountInfo.institutionNumber;
      }
    },
    function initE() {
      this.SUPER();
      this.nextLabel = this.Next;
      this.backLabel = this.Back;
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').addClass('stepBottomMargin').add(this.Instructions).end()
        .start('div').addClass('row')
          .start('p').addClass('inputFieldLabel').add(this.LabelName).end()
        .end()
        .tag(this.BANK_NAME, { onKey: true })
        .start('div').addClass('row')
          .start('p').addClass('pDefault').add(this.Guide).end()
        .end()
        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('div').addClass('col')
            .start('div').addClass('row')
              .start('p').addClass('inputFieldLabel').add(this.LabelAccount).end()
            .end()
            .tag(this.ACCOUNT_NUMBER, { onKey: true, maxLength: 35 })
          .end()
          .start('div').addClass('col')
            .start('div').addClass('row')
              .start('p').addClass('inputFieldLabel').add(this.LabelTransit).end()
            .end()
            .tag(this.TRANSIT_NUMBER, { onKey: true, maxLength: 5 })
          .end()
          .start().addClass('inline')
            .start('p').add(this.LabelInstitute).addClass('inputFieldLabel').end()
            .start(this.INSTITUTION_OTHER, { onKey: true, maxLength: 3 }).end()
          .end()
        .end();
    }
  ]
});
