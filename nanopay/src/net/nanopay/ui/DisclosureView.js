foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'DisclosureView',
  extends: 'foam.u2.View',

  documentation: '',

  requires: [
    'foam.u2.HTMLElement'
  ],

  css: `
    ^ {
      padding: 8px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.
        start(this.HTMLElement).
          addClass(this.myClass()).
          add(this.data).
        end();
    }
  ]
});
