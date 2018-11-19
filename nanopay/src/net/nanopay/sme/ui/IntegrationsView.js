foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'IntegrationsView',
  extends: 'foam.u2.View',

  documentation: `View to display list of third party services 
                  the user can integrate with`,

  css: `
    ^ .title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: normal;
      color: #2b2b2b;
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
        .add(this.Title).addClass('title')
      .end();
    }
  ]
});
