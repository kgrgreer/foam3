foam.CLASS({
    package: 'net.nanopay.tx.ui',
    name: 'PayeeSelectionView',
    extends: 'foam.u2.View',
  
    properties: [
      {
        name: 'data',
        documentation: 'The selected object.'
      },
      'fullObject',
      'viewData'
    ],
  
    methods: [
      function initE() {
        let display = 'Select a payee';   
  
        if ( this.fullObject !== undefined ) {
          display = this.fullObject.email;
        } else if ( this.viewData.payeeAccountCheck && this.viewData.payeeCard ) {
          display  = this.viewData.payeeCard.email;
        }
  
        return this
          .start()
            .add(display)
          .end();
      }
    ]
  });
  