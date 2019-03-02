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
    ^ .styleHolder_NameField {
    }
    ^ .styleHolder_EmailField {
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
          .start().addClass('styleHolder_NameField')
            .add(this.data ?
              this.fullObject$.map((obj) => {
                var formatted = '';
                if ( obj ) {
                  formatted += obj.organization || obj.businessName;
                  if ( obj.legalName.trim() ) {
                    formatted += ` (${obj.legalName})`;
                  }
                }
                return formatted;
              }) :
              this.DEFAULT_LABEL)
          .end()
          .start().addClass('styleHolder_EmailField')
            .add(this.data ?
              this.fullObject$.map((obj) => obj ? obj.email : '') :
              '')
          .end()
        .end();
    }
  ]
});
