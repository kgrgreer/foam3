foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'NextStepView',
  extends: 'foam.u2.View',

  documentation: 'next step view',

  imports: [
    'user'
  ],

  messages: [
    { name: 'Title',       message: '1. Next Step' },
    { name: 'Description', message: 'Go to portal and start using the nanopay services.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .start().addClass('containerDesc').add(this.Description).end()
        .start(this.GO_TO_PORTAL).end();
    }
  ],

  actions: [
    {
      name: 'goToPortal',
      code: function (X) {

      }
    }
  ]
});