foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'B2BOnboardingWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Onboarding Wizard for new B2B users.',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'stack',
    'auth',
    'window'
  ],

  exports: [
    'logOutHandler'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.title = 'Registration';
      this.exitLabel = 'Log Out';
      this.views = [
        { parent: 'addB2BUser', id: 'form-addB2BUser-principleOwner', label: 'Principle Owner(s) Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.AddPrincipleOwnersForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-questionnaire',  label: 'Questionnaire', view: { class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireForm' } }
      ];
      this.SUPER();
    },

    function logOutHandler(selection) {
      switch(selection) {
        case 0 : this.logOut();
                 break;
        case 1 : this.saveProgress();
                 this.logOut();
                 break;
        default: console.error('unhandled response');
      }
    },

    function saveProgress() {
      console.log('TODO: Save Progress');
    },

    function logOut() {
      var self = this;
      this.auth.logout().then(function() {
        self.window.location.hash = '';
        self.window.location.reload();
      });
    }
  ],

  actions: [
    {
      name: 'exit',
      code: function() {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.onboarding.b2b.ui.SaveAndLogOutModal' }));
      }
    },
    {
      name: 'save',
      code: function() {
        this.saveProgress();
      }
    },
    {
      name: 'goBack',
      label: 'Back',
      code: function(X) {
        this.stack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function() {
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    }
  ]
});
