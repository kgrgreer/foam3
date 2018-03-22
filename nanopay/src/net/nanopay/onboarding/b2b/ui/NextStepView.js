foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'NextStepView',
  extends: 'foam.u2.View',

  documentation: 'next step view',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'user',
    'userDAO',
    'window'
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
        .br()
        .start(this.GO_TO_PORTAL).end();
    }
  ],

  actions: [
    {
      name: 'goToPortal',
      code: function (X) {
        X.user.onboardingComplete = true;

        X.userDAO.put(X.user)
        .then(function (result) {
          X.window.location.hash = '';
          X.window.location.reload();
        })
        .catch(function (err) {
          X.add(X.NotificationMessage.create({ message: 'Sorry something went wrong.', type: 'error' }));
        });
      }
    }
  ]
});