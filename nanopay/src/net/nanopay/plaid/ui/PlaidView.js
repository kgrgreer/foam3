foam.CLASS({
  package: 'net.nanopay.plaid.ui',
  name: 'PlaidView',
  extends: 'foam.u2.Controller',

  documentation: "View for plaid integration",

  implements: [

  ],

  imports: [
    'plaidService'
  ],

  requires: [
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

  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .start().addClass(this.myClass())
          .start(this.CONNECT_BY_PLAID).addClass('blue-button').addClass('plaid-btn').end()
        .end();
    },

    async function exchangeToken(publicToken, metadata) {
      let temp = await this.plaidService.exchangeForAccessToken(null, publicToken);
      console.log(temp);
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
    }
  ]
});
