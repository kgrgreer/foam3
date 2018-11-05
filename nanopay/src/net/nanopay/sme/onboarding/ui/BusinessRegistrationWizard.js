foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessRegistrationWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'stack',
    'user'
  ],

  methods: [
    function init() {
      this.viewData.user = this.user;

      this.title = 'Your Business Profile';

      this.viewTitles = [
        'Getting Started',
        'Your Business',
        'Your Transactions',
        'Signing Officer',
        'Beneficial Ownership'
      ],

      this.views = [
        { id: 'business-registration-introduction', view: { class: 'net.nanopay.sme.onboarding.ui.IntroductionView' } },
        { id: 'business-registration-business-form', view: { class: 'net.nanopay.sme.onboarding.ui.BusinessForm' } },
        { id: 'business-registration-transaction-estimate-form', view: { class: 'net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm' } },
        { id: 'business-registration-signing-officer-form', view: { class: 'net.nanopay.sme.onboarding.ui.SigningOfficerForm' } },
        { id: 'business-registration-beneficial-owner-form', view: { class: 'net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm' } }
      ];

      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goNext',
      isAvailable: function(position) {
        return ( position < this.views.length - 1);
      },
      code: function() {
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    }
  ]
});
