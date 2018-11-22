foam.CLASS({
  package: 'net.nanopay.plaid.ui',
  name: 'PlaidView',
  extends: 'foam.u2.Controller',

  documentation: "View for plaid integration",

  implements: [

  ],

  imports: [
    'user',
    'plaidService'
  ],

  requires: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  css: `
    .container {
      margin-left: auto; margin-right: auto;
    }
    
    .plaid-btn {
      float: none;
      margin-left: auto; margin-right: auto;
      display:block;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'plaidInstitutionId'
    },
    {
      class: 'Object',
      name: 'selectedAccount'
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .start().addClass(this.myClass())
          .start(this.CONNECT_BY_PLAID).addClass('blue-button').addClass('plaid-btn').end()
          .start(this.FETCH_ACCOUNTS_DETAIL).addClass('blue-button').addClass('plaid-btn').end()
          .start(this.IMPORT_TO_SYSTEM).addClass('blue-button').addClass('plaid-btn').end()
        .end();
    },

    async function exchangeToken(publicToken, metadata) {
      let selectedAccount =
        metadata.accounts.reduce(
          (pValue, cValue) => { pValue[cValue.mask] = cValue.name; return pValue }, {}
        );

      this.plaidInstitutionId =
        await this.plaidService.exchangeForAccessToken
          ( null,
            this.PlaidPublicToken.create({
              userId: this.user.id,
              publicToken: publicToken,
              institutionName: metadata.institution.name,
              institutionId: metadata.institution.institution_id,
              selectedAccount: selectedAccount
            }));

      this.selectedAccount = selectedAccount;
      console.log(this.selectedAccount)
    },

    function onExit(err, metadata) {
      console.log(err);
    }
  ],

  actions:[
    {
      name: 'connectByPlaid',
      label: 'Link Your Bank Account',
      code: function(){

        const handler = Plaid.create({
          clientName: 'Nanopay',
          env: 'sandbox',
          key: '9022d4a959ff4d11f5074fa82f7aa0',
          product: ['transactions'],
          onSuccess: this.exchangeToken.bind(this),
          onExit: this.onExit.bind(this)
        });

        handler.open();
      }
    },
    {
      name: 'fetchAccountsDetail',
      label: 'Get Account Info',
      code: async function(){
        try {
          await this.plaidService.fetchAccountsDetail(null, this.user.id, this.plaidInstitutionId);
        } catch (e) {
          console.log(e);
        }
      }
    },
    {
      name: 'importToSystem',
      label: 'Get Account Info',
      code: async function(){
        try {
          await this.plaidService
            .importSelectedAccountToSystem(null, this.user.id, this.plaidInstitutionId, this.selectedAccount);
        } catch (e) {
          console.log(e);
        }
      }
    }
  ]
});
