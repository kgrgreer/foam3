foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'QuestionnaireView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass());
    }
  ]
});