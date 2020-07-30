/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.util',
  name: 'OnboardingUtil',

  documentation: 'Manages the Dashboard front-end',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  imports: [
    'subject',
    'auth',
    'businessOnboardingDAO',
    'canadaUsBusinessOnboardingDAO',
    'crunchController',
    'ctrl',
    'quickbooksService',
    'pushMenu',
    'stack',
    'userDAO',
    'xeroService',
    'uSBusinessOnboardingDAO',
    'user',
    'userCapabilityJunctionDAO'
  ],

  methods: [
    async function getBusinessOnboarding() {
      return this.ctrl.user.address.countryId === 'CA' ?
        await this.businessOnboardingDAO.find(
          this.AND(
            this.EQ(this.BusinessOnboarding.USER_ID, this.subject.realUser.id),
            this.EQ(this.BusinessOnboarding.BUSINESS_ID, this.user.id)
          )
        ) :
        await this.uSBusinessOnboardingDAO.find(
          this.AND(
            this.EQ(this.USBusinessOnboarding.USER_ID, this.subject.realUser.id),
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
        userId: this.subject.realUser.id,
        businessId: this.user.id,
        businessAddress: address
      };
      return this.user.address.countryId == 'CA'
        ? this.BusinessOnboarding.create(data)
        : this.USBusinessOnboarding.create(data);
    },

    async function initOnboardingView() {
      var businessOnboarding = await this.getBusinessOnboarding();
      var onboardingStatusCheck =
        businessOnboarding
        && businessOnboarding.status !== this.OnboardingStatus.SUBMITTED
        && this.user.compliance === this.ComplianceStatus.NOTREQUESTED;

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
            this.EQ(this.CanadaUsBusinessOnboarding.USER_ID, this.subject.realUser.id),
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
    },
    
    async function initUserRegistration(cap) {
      var capsAndWizlets = await this.crunchController.getCapsAndWizardlets(cap);

      capsAndWizlets.wizCaps = capsAndWizlets.wizCaps.map((wizCap) => {
        wizCap.mustBeValid = true;
        return wizCap;
      });

      var config = foam.u2.wizard.StepWizardConfig.create({ 
        allowBacktracking: false,
        allowSkipping: false
      });

      this.stack.push({
        class: 'foam.u2.wizard.StepWizardletView',
        data: foam.u2.wizard.StepWizardletController.create({
          wizardlets: capsAndWizlets.wizCaps,
          config: config
        }),
        onClose: async () => {
          let updatedUser = await this.userDAO.find(this.user.id);
          this.subject.user = updatedUser;
          this.subject.realUser = updatedUser;
          // put top-level cap to ucj
          await this.userCapabilityJunctionDAO.put(this.UserCapabilityJunction.create({
            sourceId: updatedUser,
            targetId: cap
          }));
          this.pushMenu('sme.main.appStore');
        },
        fullScreen: true,
        hideX: true,
        backDisabled: true
      });
      location.hash = 'sme.main.registration';
    }
  ]

});
