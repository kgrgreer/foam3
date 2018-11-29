foam.CLASS({
  package: 'net.nanopay.plaid.ui',
  name: 'PlaidView',
  extends: 'foam.u2.Controller',

  documentation: "View for plaid integration",

  implements: [

  ],

  imports: [
    'user',
    'plaidService',
    'stack',
    'appConfig',
    'plaidCredential',
    'ctrl'
  ],

  requires: [
    'net.nanopay.plaid.model.PlaidPublicToken',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .plaid-logo-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    
    .plaid-logo {
      width: 100pt;
      height: 100pt;
    }
    
    .plaid-log-right {
      width: 100pt;
      height: 150pt;
    }
    
    .plaid-logo-plus {
      width: 100pt; height: 30pt;
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
    {
      name: 'isLoading',
      class: 'Boolean',
      value: false
    },
    {
      class: 'Function',
      name: 'onSuccess'
    },
    {
      class: 'Function',
      name: 'onFailure'
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .start().addClass(this.myClass())
        .start('div').addClass('container')
          .start().show(self.isLoading$.map(v => v === true))
            .start({class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg'})
              .addClass('plaid-logo').addClass('plaid-loading')
              .end()
          .end()
          .start().show(self.isLoading$.map(v => v === false))
            .start('div').addClass('plaid-logo-container')
              .start({class: 'foam.u2.tag.Image', data: 'images/ablii-logo.svg'}).addClass('plaid-logo').end()
              .start({class: 'foam.u2.tag.Image', data: 'images/plus.svg'}).addClass('plaid-logo-plus').end()
              .start({class: 'foam.u2.tag.Image', data: 'images/plaid-logo.png'}).addClass('plaid-log-right').end()
            .end()
          .end()
          .add(this.CONNECT_BY_PLAID).end()
        .end()
        .end();
    },

    async function connect(publicToken, metadata) {
      this.isLoading = true;

      let selectedAccount =
        metadata.accounts.reduce(
          (pValue, cValue) => { pValue[cValue.mask] = cValue.name; return pValue }, {}
        );

      try {
        let error = await this.plaidService.startIntegration
          ( null,
            this.PlaidPublicToken.create({
              userId: this.user.id,
              publicToken: publicToken,
              institutionName: metadata.institution.name,
              institutionId: metadata.institution.institution_id,
              selectedAccount: selectedAccount
            }));

        if ( error === undefined ) {
          this.showNotification('Congratulations, your USD Bank Account has been added to your usable accounts.');
        } else {
          this.errorHandler(error);
        }

      } catch (e) {
        this.onFailure(e);
      }

      this.isLoading = false;
    },

    function onExit(err, metadata) {
      this.isLoading = false;
      if ( err !== null) {
        this.errorHandler(err);
      }
    },

    function errorHandler(error) {
      switch (error.error_code) {
        default:
          let msg =
            error.display_message !== "" ? error.display_message : error.error_code;
          this.showNotification(msg, 'error')
      }
    },

    function showNotification(msg, type) {
      this.ctrl.add(this.NotificationMessage.create({ message: msg, type: type}));
    }
  ],

  actions:[
    {
      name: 'connectByPlaid',
      label: 'Connect',
      code: async function(){

        let credential = await this.plaidService.getCredentialForClient();

        const handler = Plaid.create({
          clientName: credential.clientName,
          env: credential.env,
          key: credential.publicKey,
          product: ['auth', 'transactions'],
          onSuccess: this.connect.bind(this),
          onExit: this.onExit.bind(this)
        });

        handler.open();
      }
    }
  ]
});
