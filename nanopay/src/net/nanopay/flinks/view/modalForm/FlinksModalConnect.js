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
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalConnect',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Login screen for Flinks',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.LoadingSpinner',
    'foam.u2.dialog.Popup',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentService'
  ],

  exports: [
    'as connect'
  ],

  imports: [
    'acceptanceDocumentService',
    'connectingMessage',
    'flinksAuth',
    'institution',
    'isConnecting',
    'notify',
    'subject'
  ],

  css: `
    ^content {
      box-sizing: border-box;
      min-width: 615px;
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^ .foam-u2-tag-Input {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .foam-u2-tag-Input:focus {
      border: 1px solid /*%PRIMARY3%*/ #406dea !important;
    }
    ^ .property-username {
      width: 100%;
      height: 40px;
    }
    ^terms-container {
      margin-top: 24px;
      font-size: 12;
    }
    ^terms-text-container {
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
      max-width: calc(100% - 40px);
    }
    ^checkbox {
      display: inline-block;
    }
    ^ .net-nanopay-ui-DataSecurityBanner {
      margin-top: 24px;
    }
    ^ .net-nanopay-ui-modal-TandCModal .iframe-container {
      height: 540px;
    }
    ^ .net-nanopay-ui-modal-TandCModal .net-nanopay-ui-modal-ModalHeader {
      display: none;
    }
    ^ label > span {
      display: none;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'String',
      name: 'username',
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      },
      postSet: function(_, n) {
        this.viewData.username = n;
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: {
        class: 'foam.u2.view.PasswordView',
        onKey: true
      }
    },
    {
      class: 'Boolean',
      name: 'isTermsAgreed',
      value: false,
      postSet: function(oldValue, newValue) {
        if ( this.termsAgreementDocument ) {
          this.acceptanceDocumentService.
            updateUserAcceptanceDocument(this.__context__, this.subject.realUser.id, this.subject.user.id, this.termsAgreementDocument.id, newValue);
        }
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'termsAgreementDocument'
    },
  ],

  messages: [
    { name: 'CONNECTING', message: 'Securely connecting you to your institution. Please do not close this window.' },
    { name: 'ERROR', message: 'An unknown error has occurred' },
    { name: 'INVALID_FORM', message: 'Please complete the form before proceeding' },
    { name: 'ACCEPT_CONDITIONS', message: 'Please accept the terms and conditions before proceeding' },
    { name: 'LABEL_USERNAME', message: 'Access Card # / Username' },
    { name: 'LABEL_PASSWORD', message: 'Password' },
    { name: 'LEGAL_1', message: 'I agree to the ' },
    { name: 'LEGAL_2', message: 'terms and conditions' },
    { name: 'LEGAL_3', message: ' and authorize the release of my Bank information to nanopay.' },
    { name: 'TERMS_AGREEMENT_DOCUMENT_NAME', message: 'NanopayTermsAndConditions' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.connectingMessage = this.CONNECTING;
      this.loadAcceptanceDocument();
    },

    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.connectingMessage).addClass('spinner-text').end()
            .end()
          .end()
          .start('p').addClass('field-label').add(this.LABEL_USERNAME).end()
          .tag(this.USERNAME)
          .start('p').addClass('field-label').add(this.LABEL_PASSWORD).end()
          .tag(this.PASSWORD)
          .start({ class: 'net.nanopay.ui.DataSecurityBanner' }).end()
          .start().addClass(this.myClass('terms-container'))
            .start(this.IS_TERMS_AGREED).addClass(this.myClass('checkbox')).end()
            .start().addClass(this.myClass('terms-text-container'))
              .add(this.LEGAL_1)
              .start('a')
                .attrs({
                  href: this.termsAgreementDocument$.dot('link'),
                  target: '_blank'
                })
                .add(this.LEGAL_2)
              .end()
              .add(this.LEGAL_3)
            .end()
          .end()
        .end()
        .start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).end();
    },

    async function connectToBank() {
      this.isConnecting = true;
      try {
        var response = await this.flinksAuth.authorize(
          null,
          this.institution.name,
          this.username, this.password,
          this.subject.user
        );
      } catch (error) {
        this.notify(`${error.message}. Please try again.`, '', this.LogLevel.ERROR, true);
        return;
      } finally {
        this.isConnecting = false;
      }
      switch ( response.HttpStatusCode ) {
        case 200:
          this.viewData.accounts = response.Accounts;
          this.pushToId('accountSelection');
          break;
        case 203:
          this.viewData.requestId = response.RequestId;
          this.viewData.securityChallenges = response.SecurityChallenges;
          this.pushToId('security');
          break;
        case 401:
          this.notify(response.Message, '', this.LogLevel.ERROR, true);
          break;
        default:
          this.notify(this.ERROR, '', this.LogLevel.ERROR, true);
          break;
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Connect',
      code: function(X) {
        var model = X.connect;
        if ( model.isConnecting ) return;
        if ( ! ( model.username.trim().length > 0 && model.password.trim().length > 0 ) ) {
          X.notify(model.INVALID_FORM, '', this.LogLevel.ERROR, true);
          return;
        }
        if ( ! model.isTermsAgreed ) {
          X.notify(model.ACCEPT_CONDITIONS, '', this.LogLevel.ERROR, true);
          return;
        }
        X.connect.connectToBank();
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

