foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'HomeView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass());
    }
  ]
});
