
foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'MenuChoiceSelection',
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
      let display = 'Menu selector';

      if ( this.fullObject !== undefined ) {
        display = this.fullObject.label;
      }

      return this
        .start()
          .add(display)
        .end();
    }
  ]
});
