foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'B2BOnboardingWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Onboarding Wizard for new B2B users.',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.title = 'Registration';
      this.views = [
        { parent: 'addB2BUser', id: 'form-addB2BUser-principleOwner', label: 'Principle Owner(s) Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.AddPrincipleOwnersForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-questionnaire',  label: 'Questionnaire', view: { class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireView' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
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
        //this.stack.back();
      }
    }
  ]
});
