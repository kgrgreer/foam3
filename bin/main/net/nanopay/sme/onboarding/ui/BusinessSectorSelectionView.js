foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessSectorSelectionView',
  extends: 'foam.u2.Element',

  documentation: `The selection view for a RichChoiceView of BusinessSectors.`,

  css: `
    ^ {
      background: white;
      padding: 8px 16px;
      font-size: 12px;
      color: #424242;
    }
  `,

  messages: [
    { name: 'DEFAULT_LABEL', message: 'Select industry...' }
  ],

  properties: [
    'data',
    'fullObject'
  ],

  methods: [
    function initE() {
      return this
        .addClass(this.myClass())
        .start()
          .add(this.data
            ? this.fullObject$.map((obj) => obj ? obj.name : '')
            : this.DEFAULT_LABEL
          )
        .end();
    }
  ]
});
