foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddBusinessView',
  extends: 'foam.u2.Controller',

  documentation: 'View for adding a business',

  css: `
  `,

  properties: [

  ],

  messages: [

  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
        .end();
    }
  ]
});