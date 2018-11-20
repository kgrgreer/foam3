foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'IntegrationsView',
  extends: 'foam.u2.Controller',

  documentation: `View to display list of third party services 
                  the user can integrate with`,

  css: `
    ^ .title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: normal;
      color: #2b2b2b;
      margin-bottom: 16px;
    }
    ^ .integration-box {
      width: 456px;
      height: 42px;
      border-radius: 3px;
      box-shadow: 1px 1.5px 1.5px 1px #dae1e9;
      background-color: #ffffff;
      display: inline-block;
      margin-right: 16px;
      padding: 15px 24px 15px 24px;
      vertical-align: middle;
    }
    ^ .xero-logo {
      position: relative;
      bottom: 8.5;
      width: 57px;
      height: 57px;
      display: inline-block;
    }
    ^ .qb-logo {
      position: relative;
      top: 1;
      width: 39px;
      height: 39px;
      display: inline-block;
      margin-left: 6px;
      margin-right: 8px;
    }
    ^ .integration-box-title {
      font-size: 14px;
      font-weight: 900;
      color: #2b2b2b;
    }
    ^ .integration-info-div {
      margin-left: 10px;
      vertical-align: top;
      display: inline-block;
    }
    ^ .account-info {
      font-size: 14px;
      color: #8e9090;
      margin-top: 7px;
    }
    ^ .net-nanopay-ui-ActionView {
      width: 96px;
      height: 36px;
      border-radius: 4px;
      border: 1px solid #604aff;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #ffffff;
      float: right;
      font-size: 14px;
      font-weight: 600;
      color: #604aff;
      margin-top: 3px;
    }
    ^ .net-nanopay-ui-ActionView:hover {
      color: white;
    }
  `,

  messages: [
    { name: 'Title', message: 'Integrations' }
  ],

  properties: [],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().add('Integrations').addClass('title').end()
          .start().addClass('integration-box')
            .start({ class: 'foam.u2.tag.Image', data: '/images/setting/integration/xero_logo.svg' }).addClass('xero-logo').end()
            .start().addClass('integration-info-div')
              .start().add('Xero accounting').addClass('integration-box-title').end()
              .start().add('Account ID: c43f534').addClass('account-info').end()
            .end()
            .start(this.XERO_CONNECT).end()
          .end()
          .start().addClass('integration-box')
            .start({ class: 'foam.u2.tag.Image', data: '/images/setting/integration/quickbooks_logo.png' }).addClass('qb-logo').end()
            .start().addClass('integration-info-div')
              .start().add('Intuit quickbooks').addClass('integration-box-title').end()
              .start().add('Not connected').addClass('account-info').end()
            .end()
            .start(this.QUICKBOOKS_CONNECT).end()
          .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'xeroConnect',
      label: 'Connect',
      code: function() {
        var url = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
        window.location = url;
      }
    },
    {
      name: 'quickbooksConnect',
      label: 'Connect',
      code: function() {
        var url = window.location.origin + '/service/quick?portRedirect=' + window.location.hash.slice(1);
        window.location = url;
      }
    }
  ]
});
