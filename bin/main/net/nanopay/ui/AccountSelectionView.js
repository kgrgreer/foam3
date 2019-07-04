foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'AccountSelectionView',
    extends: 'foam.u2.View',

    documentation: `The selection view for a RichChoiceView for account to display id, name and currency.`,

    properties: [
      {
        name: 'data'
      },
      {
        name: 'fullObject'
      }
    ],

    messages: [
      {
        name: 'DEFAULT_LABEL',
        message: 'Select an Account'
      }
    ],

    methods: [
         function initE() {
           return this
             .addClass(this.myClass())
               .callIfElse(
                 this.data,
                 function() {
                   this.add(this.fullObject$.map((account) => {
                     if ( account ) {
                       return this.E()
                         .add(`${account.id}, ${account.name} ${account.denomination}`);
                     }
                   }));
                 },
                 function() {
                   this.add(this.DEFAULT_LABEL);
                 }
               );
         }
    ]
});
