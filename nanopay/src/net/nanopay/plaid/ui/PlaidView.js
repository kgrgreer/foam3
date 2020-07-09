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
  package: 'net.nanopay.plaid.ui',
  name: 'PlaidView',
  extends: 'foam.u2.Controller',

  documentation: "View for plaid integration",

  imports: [
    'user',
    'plaidService',
    'stack',
    'appConfig',
    'plaidCredential',
    'ctrl',
    'notify'
  ],

  requires: [
    'net.nanopay.plaid.model.PlaidPublicToken',
    'net.nanopay.plaid.PlaidResponseItem',
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup'
  ],

  css: `
    ^ .plaid-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    ^ .plaid-header {
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 0px; margin-top: 60px;
    }
    
    .plaid-logo-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 117px;
    }
    
    .plaid-logo {
      width: 52px;
      height: 52px;
      margin-right: 17px;
    }
    
    .plaid-log-right {
      width: 44px;
      height: 69px;
      margin-left: 17px;
    }
    
    .plaid-logo-plus {
      width: 10px; height: 19px;
    }
    
    ^ .plaid-loading {
      width: 52px; height: 52px;
    }
    
    ^ .plaid-loading-container {
      display: flex;
      align-items: center;
      height: 117px;
    }
    
    ^ .container .foam-u2-ActionView {
      width: 96px;
      height: 36px;
      font-size: 14px;
    }
    
    ^ .otherbank-container p {
      display: inline !important;
    }
    
    ^ .otherbank-container {
      margin-top: 54px;
    }
    
     ^ .otherbank-container .link-text {
      color: #604aff;
    }
    
     ^ .otherbank-container .link-text:hover {
      cursor: pointer;
    }
    
    .plaid-loading {
      animation:plaid-rotate 1s linear infinite;
    }
    
    @keyframes plaid-rotate {
      0%{ -webkit-transform: rotate(0deg);}
      50%{ -webkit-transform: rotate(180deg);}
      100%{ -webkit-transform: rotate(360deg);}
    }
  `,

  properties: [
    'onComplete',
    {
      name: 'isLoading',
      class: 'Boolean',
      value: false
    },
    {
      name: 'isUpdateMode',
      class: 'Boolean',
      value: false
    },
    {
      class: 'String',
      name: 'hint',
      value: 'Please click the Connect button to start'
    },
    {
      class: 'String',
      name: 'logoPath',
      value: ''
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .start().addClass(this.myClass())
        .start().addClass('plaid-container')

          .start('p').addClass('plaid-header')
            .add('Connect to your account with Plaid')
          .end()

          .start().show(self.isLoading$.map(v => v === true)).addClass('plaid-loading-container')
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg' })
              .addClass('plaid-loading')
            .end()
          .end()

          .start().show(self.isLoading$.map(v => v === false))
            .start().addClass('plaid-logo-container')
              .start({ class: 'foam.u2.tag.Image', data: this.logoPath }).addClass('plaid-logo').end()
              .start({ class: 'foam.u2.tag.Image', data: 'images/plus-no-bg-black.svg' }).addClass('plaid-logo-plus').end()
              .start({ class: 'foam.u2.tag.Image', data: 'images/plaid-logo-black.png' }).addClass('plaid-log-right').end()
            .end()
          .end()

          .start('p').show(false)
            .add(this.hint$)
          .end()

          .add(this.CONNECT)
        .end()
        .end();
    },

    /**
     * START FROM HERE
     *
     * Launch the plaid integration
     *
     * 1. Get the plaid credential from the Nanopay server
     * 2. Integrating with Plaid Link, see https://plaid.com/docs/#integrating-with-link
     * 3. onSuccess or onExit callback
     */
    async function connectByPlaid() {
      let credential = await this.plaidService.getCredentialForClient(null, this.user.id);

      let param = {
        clientName: credential.clientName,
        env: credential.env,
        key: credential.publicKey,
        webhook: credential.webhook,
        product: ['auth', 'transactions', 'identity'],
        countryCodes: ['US'],
        onSuccess: this.onSuccess.bind(this),
        onExit: this.onExit.bind(this)
      };

      if ( credential.token !== null && credential.token !== '' ) {
        param['token'] = credential.token;
        this.isUpdateMode = true;
        alert('It seems like you have changed your credential recently, re-login required');
      }

      const handler = Plaid.create(param);

      handler.open();
    },

    // the success callback function of Plaid Link component
    // see https://plaid.com/docs/#onsuccess-callback
    async function onSuccess(publicToken, metadata) {
      this.isLoading = true;

      // key   : Account mask
      // value : Account name
      let selectedAccount =
        metadata.accounts.reduce(
          (pValue, cValue) => { pValue[cValue.mask] = cValue.name; return pValue }, {}
        );

      if ( Object.keys(selectedAccount).length > 1 ) {
        this.showNotification('Only 1 bank account can be added.', this.LogLevel.WARN);
        this.isLoading = false;
        return;
      }

      try {
        let responseItem = this.PlaidResponseItem.create();        
        let response = await this.plaidService.startIntegration
          ( null,
            this.PlaidPublicToken.create({
              userId: this.user.id,
              publicToken: publicToken,
              institutionName: metadata.institution.name,
              institutionId: metadata.institution.institution_id,
              selectedAccount: selectedAccount,
              isUpdateMode: this.isUpdateMode
            }));
        responseItem.userId = response.userId;
        responseItem.InstitutionId = response.InstitutionId;
        responseItem.accountDetail = response.accountDetail;
        responseItem.account = response.account;
        responseItem.plaidItem = response.plaidItem;
        responseItem.plaidError = response.plaidError;
        responseItem.account.plaidResponseItem = responseItem;
        // No errors, success
        if ( responseItem.plaidError === undefined ) {
          if ( this.isUpdateMode ) {
            this.hint = 'Congratulations, you have re-connected to Nanopay, you can add a new Bank account now';
            this.isUpdateMode = false;
          } else {
            this.hint = 'You can add another bank account by clicking the Connect button again';

            this.add(this.Popup.create().tag({
              class: 'net.nanopay.account.ui.BankAccountWizard',
              data: responseItem.account,
              useSections: ['pad']
            }));
          }
        }

        // if error returns, we have to handle the error
        if ( responseItem.plaidError !== undefined ) {
          this.hint = 'Oops! Retry?';
          this.errorHandler(responseItem.plaidError);
        }

        // Any Exception
      } catch (e) {
        this.isUpdateMode = false;
        this.hint = 'Oops! Retry?';
        this.showNotification(e.message, this.LogLevel.ERROR);
      }

      this.isLoading = false;
    },

    // Plaid onExit callback
    // see https://plaid.com/docs/#onexit-callback
    function onExit(err, metadata) {
      this.isLoading = false;
      if ( err !== null) {
        this.errorHandler(err);
      }
    },

    // See PlaidError
    // Error handling
    function errorHandler(error) {
      switch (error.error_code) {
        case 'ITEM_LOGIN_REQUIRED':
          this.connectByPlaid();
          break;
        default:
          let msg =
            error.display_message !== "" ? error.display_message : error.error_code;
          this.showNotification(msg, this.LogLevel.ERROR)
      }
    },

    function showNotification(msg, type) {
      this.notify(msg, '', type, true);
    }
  ],

  actions:[
    {
      name: 'Connect',
      label: 'Connect',
      code: async function(){
        this.connectByPlaid();
      }
    }
  ]
});
