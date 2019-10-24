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
    'net.nanopay.sme.onboarding.OnboardingStatus'
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

  properties: [
    {
      class: 'Boolean',
      name: 'isfirstTimeLogin',
    }
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
            this.EQ(this.BusinessOnboarding.USER_ID, this.agent.id),
            this.EQ(this.BusinessOnboarding.BUSINESS_ID, this.user.id)
          )
        );
    },

    async function isSigningOfficer() {
      var onboarding = await this.getBusinessOnboarding();
      return onboarding.signingOfficer;
    },

    async function initOnboardingView() {
      if ( this.isfirstTimeLogin ) return;
      var businessOnboardingInfor = await this.getBusinessOnboarding();
      if ( businessOnboardingInfor && businessOnboardingInfor.status !== this.OnboardingStatus.SUBMITTED ) {
        this.stack.push({
          class: 'net.nanopay.sme.onboarding.ui.WizardView',
          data: businessOnboardingInfor
        });
      }
      this.isfirstTimeLogin = true;
    }
  ]

});
