foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserSelectionView',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  `,

  messages: [
    {
      name: 'DEFAULT_LABEL',
      message: 'Select...'
    }
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'fullObject'
    }
  ],

  methods: [
    function initE() {
      return this
        .start()
          .addClass(this.myClass())
          .start()
            .add(this.data ?
              this.fullObject$.map((obj) => {
                return obj ?
                  `${obj.legalName} (${obj.organization || obj.businessName})` :
                  '';
              }) :
              this.DEFAULT_LABEL)
          .end()
          .start()
            .add(this.data ?
              this.fullObject$.map((obj) => obj ? obj.email : '') :
              '')
          .end()
        .end();
    }
  ]
});
