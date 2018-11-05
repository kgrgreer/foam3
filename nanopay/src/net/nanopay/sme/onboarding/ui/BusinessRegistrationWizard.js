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

  properties: [
    {

    }
  ],

  methods: [
    function init() {
      this.viewData.user = this.user;

      this.views = [
        { id: 'business-registration-introduction', view: { class: 'net.nanopay.sme.onboarding.ui.Introduction' } },
        { id: 'business-registration-business-form', view: { class: 'net.nanopay.sme.onboarding.ui.BusinessForm' } },
        { id: 'business-registration-signing-officer-form', view: { class: 'net.nanopay.sme.onboarding.ui.SigningOfficerForm' } },
        { id: 'business-registration-beneficial-owner-form', view: { class: 'net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm' } }
      ];

      this.SUPER();
    }
  ]
});
