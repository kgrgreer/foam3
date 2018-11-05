foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'IntroductionView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .add('Title')
        .end();
    }
  ]
});
