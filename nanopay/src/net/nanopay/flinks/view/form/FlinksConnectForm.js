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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksConnectForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.u2.PopupView',
    'foam.u2.LoadingSpinner',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentService'
  ],
  imports: [
    'acceptanceDocumentService',
    'bankInstitutions',
    'fail',
    'flinksAuth',
    'form',
    'isConnecting',
    'loadingSpinner',
    'notify',
    'pushViews',
    'rollBackView',
    'success',
    'subject',
    'window'
  ],

  css: `
    ^ {
      width: 490px;
    }
    ^ .text {
      height: 16px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0px;
    }
    ^ .input,
    ^ .input input {
      width: 450px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-color: rgba(164, 179, 184, 0.5) !important;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21) !important;
      outline: none;
      padding: 10px;
    }
    ^ .subContent {
      height: 285px;
    }
    ^ .conditionText {
      height: 16px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 0.1;
      letter-spacing: 0.1px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      border: 1px solid red;
    }
    ^ .foam-u2-ActionView-nextButton {
      float: right;
      margin: 0;
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

    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .foam-u2-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-left: 1px;
    }

    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }

    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }

    ^ .foam-u2-ActionView-goToTerm {
      text-decoration: underline;
      background-color: transparent !important;
      color: #59a5d5;
      height: 25px;
    }

    ^ .pStyle {
      width: 428px;
      height: 32px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      word-wrap: break-word;
    }
    ^ .foam-u2-view-PasswordView {
      padding: 0;
      border: none;
    }
    input[type='checkbox']:checked:after {
      top: 1px;
      left: -1px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'username',
      postSet: function(oldValue, newValue) {
        this.viewData.username = newValue;
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'conditionAgree',
      value: false,
      postSet: function(oldValue, newValue) {
        this.viewData.check = newValue;
        if ( this.termsAgreementDocument ) {
          this.acceptanceDocumentService.
            updateUserAcceptanceDocument(this.__context__, this.subject.realUser.id, this.subject.user.id, this.termsAgreementDocument.id, newValue); 
        }
      },
    },
    {
      class: 'String',
      name: 'version'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'termsAgreementDocument'
    },
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Login to your bank account and securely connect with nanopay.' },
    { name: 'LoginName', message: 'Access Card No. / Username' },
    { name: 'LoginPassword', message: 'Password' },
    { name: 'errorUsername', message: 'Invalid Username' },
    { name: 'errorPassword', message: 'Invalid Password' },
    { name: 'TERMS_AGREEMENT_DOCUMENT_NAME', message: 'NanopayTermsAndConditions' },
  ],
  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'Connect';
      this.conditionAgree = false;
      this.loadingSpinner = this.LoadingSpinner.create();
      this.loadingSpinner.hide();
      this.loadAcceptanceDocument();
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({ class: 'net.nanopay.flinks.view.form.FlinksSubHeader', secondImg: this.viewData.selectedInstitution.image })
          .start('p').addClass('text').style({ 'margin-left': '20px' })
            .add(this.LoginName)
          .end()
          .start(this.USERNAME, { onKey: true }).style({ 'margin-left': '20px', 'margin-top': '8px' }).addClass('input').end()
          .start('p').addClass('text').style({ 'margin-left': '20px', 'margin-top': '20px' })
            .add(this.LoginPassword)
          .end()
          .start(this.PASSWORD, { onKey: true }).style({ 'margin-left': '20px', 'margin-top': '8px' }).addClass('input').end()
          .start('div').style({ 'margin-top': '2px' })
            .start('div').style({ 'display': 'inline-block', 'vertical-align': 'top' })
              .start(this.CONDITION_AGREE).style({ 'height': '14px', 'width': '14px', 'margin-left': '20px', 'margin-right': '8px', 'margin-top': '15px' }).end()
            .end()
            .start('div').style({ 'display': 'inline-block' }).addClass('pStyle')
              .add('I agree to the')
              .start(this.GO_TO_TERM).end()
              .add('and authorize the release of my Bank information to nanopay.')
            .end()
          .end()
          .start()
            .start(this.loadingSpinner).addClass('loadingSpinner')
              .start('h6').add('Connecting, please wait...').addClass('spinnerText').end()
            .end()
          .end()
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({ 'clear': 'both' }).end();
    },

    async function connectToBank() {
      this.isConnecting = true;
      this.loadingSpinner.show();
      try {
        var response = await this.flinksAuth.authorize(
          null,
          this.viewData.selectedInstitution.name,
          this.username, this.password,
          this.subject.user
        );
      } catch (error) {
        this.notify(`${error.message}. Please try again.`, '', this.LogLevel.ERROR, true);
        return;
      } finally {
        this.isConnecting = false;
        this.loadingSpinner.hide();
      }
      switch ( response.HttpStatusCode ) {
        case 200:
          this.viewData.accounts = response.Accounts;
          this.success();
          break;
        case 203:
          this.viewData.requestId = response.RequestId;
          this.viewData.securityChallenges = response.SecurityChallenges;
          this.pushViews('FlinksSecurityChallenge');
          break;
        case 401:
          this.notify(response.Message, '', this.LogLevel.ERROR, true);
          break;
        default:
          break;
      }
    },     
  ],

  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting, username, password, conditionAgree) {
        return ! isConnecting && conditionAgree &&
          username.trim().length > 0 && password.trim().length > 0;
      },
      code: function(X) {
        this.connectToBank();
      }
    },
    {
      name: 'closeButton',
      label: 'Back',
      isEnabled: (isConnecting) => ! isConnecting,
      code: function(X) {
        // close the form
        this.rollBackView();
      }
    },
    {
      name: 'goToTerm',
      label: 'terms and conditions',
      code: function(X) {
        window.open(this.termsAgreementDocument.link);
      }
    }
  ],

  listeners: [
    async function loadAcceptanceDocument() {
      try {
        this.termsAgreementDocument = await this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, this.TERMS_AGREEMENT_DOCUMENT_NAME, '');
      } catch (error) {
        console.warn('Error occurred finding Terms Agreement: ', error);
      }
    }
  ]
});

