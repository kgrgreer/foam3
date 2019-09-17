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
      margin-right: 8px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'emptySelectionLabel',
      documentation: 'Empty selection label',
      value: 'Select...'
    },
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
        .attrs({ name: "userSelectionView" })
          .addClass(this.myClass())
          .start().addClass('styleHolder_NameField')
            .add(this.data ?
              this.fullObject$.map((obj) => {
                var formatted = '';
                if ( obj ) {
                  formatted += obj.organization || obj.businessName;
                  if ( obj.legalName && obj.legalName.trim() ) {
                    formatted += ` (${obj.legalName})`; 
                  }
                }
                return formatted;
              }) :
              this.emptySelectionLabel)
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
