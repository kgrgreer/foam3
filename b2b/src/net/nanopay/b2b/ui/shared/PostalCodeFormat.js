foam.CLASS({
  package: 'net.nanopay.b2b.ui.shared',
  name: 'PostalCodeFormat',
  extends: 'foam.u2.tag.Input',

  properties: [
    {
      name: 'regEx',
      factory: function(){
        return new RegExp('/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/');
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
    }
  ]
});