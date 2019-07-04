foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessSectorCitationView',
  extends: 'foam.u2.Element',

  documentation: `The row view for a RichChoiceView of BusinessSectors.`,

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
      font-size: 12px;
      color: #424242;
    }

    ^:hover {
      background: #f4f4f9;
      cursor: pointer;
    }
  `,

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      return this
        .addClass(this.myClass())
        .start()
          .add(this.data.name)
        .end();
    }
  ]
});
