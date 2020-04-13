foam.CLASS({
  package: 'net.nanopay.util',
  name: 'OnboardingUtil',

  documentation: 'Manages the Dashboard front-end',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  imports: [
    'agent',
    'auth',
    'businessOnboardingDAO',
    'canadaUsBusinessOnboardingDAO',
    'ctrl',
    'quickbooksService',
    'stack',
    'userDAO',
    'xeroService',
    'uSBusinessOnboardingDAO',
    'user',
  ],

  methods: [
    async function getBusinessOnboarding() {
      return this.ctrl.user.address.countryId === 'CA' ?
        await this.businessOnboardingDAO.find(
          this.AND(
            this.EQ(this.BusinessOnboarding.USER_ID, this.agent.id),
            this.EQ(this.BusinessOnboarding.BUSINESS_ID, this.user.id)
          )
        ) :
        await this.uSBusinessOnboardingDAO.find(
          this.AND(
            this.EQ(this.USBusinessOnboarding.USER_ID, this.agent.id),
            this.EQ(this.USBusinessOnboarding.BUSINESS_ID, this.user.id)
          )
        );
    },

    async function isSigningOfficer() {
      var onboarding = await this.getBusinessOnboarding();
      return onboarding.signingOfficer;
    },

    async function createOnboarding() {
      var address = this.user.address.clone();
      var data = {
        userId: this.agent.id,
        businessId: this.user.id,
        businessAddress: address
      };
      return this.user.address.countryId == 'CA'
        ? this.BusinessOnboarding.create(data)
        : this.USBusinessOnboarding.create(data);
    },

    async function initOnboardingView() {
      var businessOnboarding = await this.getBusinessOnboarding();
      var onboardingStatusCheck = businessOnboarding && businessOnboarding.status !== this.OnboardingStatus.SUBMITTED && this.user.compliance === this.ComplianceStatus.NOTREQUESTED;
      if ( ! businessOnboarding || onboardingStatusCheck ) {
        this.stack.push({
          class: 'net.nanopay.sme.onboarding.ui.WizardView',
          data: businessOnboarding ? businessOnboarding : await this.createOnboarding()
        });
        location.hash = 'sme.main.onboarding';
      }

      return;
    },

    async function initInternationalOnboardingView() {
      await this.canadaUsBusinessOnboardingDAO.find(
        this.AND(
            this.EQ(this.CanadaUsBusinessOnboarding.USER_ID, this.agent.id),
            this.EQ(this.CanadaUsBusinessOnboarding.BUSINESS_ID, this.user.id)
          )
        ).then((businessOnboarding) => {
          if ( businessOnboarding ) {
            if ( businessOnboarding.status !== this.OnboardingStatus.SUBMITTED ) {
              this.stack.push({
                class: 'net.nanopay.sme.onboarding.ui.WizardView',
                data: businessOnboarding
              });
              location.hash = 'sme.main.onboarding.international';
            }
          }
        });
    }
  ]

});
