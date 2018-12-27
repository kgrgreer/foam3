foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'DisclosureView',
  extends: 'foam.u2.View',

  documentation: '',

  requires: [
    'foam.u2.HTMLElement',
    'foam.flow.Document'
  ],

  css: `
    ^ {
      padding: 8px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.add(this.Document.create({ markup: this.data }));

    }
  ]
});
