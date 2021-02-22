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
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'UnlockPaymentsCard',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    The cards displayed to the user telling them if they have enabled domestic/international payments
  `,

  requires: [
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
  ],

  imports: [
    'subject',
    'businessOnboardingDAO',
    'canadaUsBusinessOnboardingDAO',
    'uSBusinessOnboardingDAO',
    'menuDAO',
    'stack',
    'auth',
    'appConfigService'
  ],

  css: `
    ^ {
      width: 500px;
      height: 173px;
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      position: relative;
      padding: 24px;
      background-size: cover;
      background-repeat: no-repeat;
    }
    ^info-box {
      display: inline-block;
      width: 260px;
      height: 100px;
    }
    ^title {
      height: 24px;
      margin: 0;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 15px;
      font-weight: 900;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^description {
      margin: 0;
      margin-top: 8px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #525455;
    }
    ^ .foam-u2-ActionView-getStarted {
      margin-top: 10px;
    }
    ^complete-container {
      margin-top: 24px;
    }
    ^icon {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    ^complete {
      display: inline-block;
      vertical-align: middle;
      margin: 0;

      font-size: 14px;
      line-height: 1.71;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  messages: [
    {
      name: 'TITLE_DOMESTIC',
      message: 'Unlock domestic payments'
    },
    {
      name: 'TITLE_US_DOMESTIC',
      message: 'Unlock US and Canadian Payments'
    },
    {
      name: 'TITLE_INTERNATIONAL',
      message: 'Unlock international payments'
    },
    {
      name: 'TITLE_INTERNATIONAL_CAD',
      message: 'Unlock International payments'
    },
    {
      name: 'DESCRIPTION_DOMESTIC',
      message: 'Complete the requirements and unlock domestic payments'
    },
    {
      name: 'DESCRIPTION_US_DOMESTIC',
      message: 'Complete the requirements and unlock domestic and Canadian Payments'
    },
    {
      name: 'DESCRIPTION_INTERNATIONAL',
      message: 'We are adding the ability to make FX payments around the world using '
    },
    {
      name: 'DESCRIPTION_CAD_INTERNATIONAL',
      message: 'Complete the requirements to unlock payments to the US and India!'
    },
    {
      name: 'COMPLETE',
      message: 'Completed'
    },
    {
      name: 'PENDING',
      message: 'pending domestic completion!'
    },
    {
      name: 'PENDING_TWO',
      message: 'pending!'
    },
    {
      name: 'COMING_SOON',
      message: 'Coming soon!'
    },
    {
      name: 'DESCRIPTION_ONBOARDING_INCOMPLETION',
      message: 'Your on boarding is incomplete. We are waiting for a signing officer to review and submit the requirements.'
    }
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
      name: 'type',
      factory: function() {
        return this.UnlockPaymentsCardType.DOMESTIC;
      },
      documentation: `
        Type to be set by developer. Defaults to domestic.
      `
    },
    {
      class: 'String',
      name: 'flagImgPath',
      expression: function(subject, type) {
        const country = subject.user.address.countryId;
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL ) {
          return 'url(\'images/ablii/InternationalCard.png\')'
        }
        switch ( country ) {
          case 'CA':
            return 'url(\'images/ablii/CanadaCard.png\')';
          case 'US':
            return 'url(\'images/ablii/AmericaCard.png\')';
          default:
            return 'url(\'images/ablii/CanadaCard.png\')';
            break;
        }
      },
      documentation: `
        Image path based on user country (currently CA/US), and card type selected.
      `
    },
    {
      class: 'String',
      name: 'title',
      expression: function(type) {
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL && ! this.isCanadianBusiness ) {
          return this.TITLE_INTERNATIONAL;
        }
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL && this.isCanadianBusiness ) {
          return this.TITLE_INTERNATIONAL_CAD;
        }
        return this.isCanadianBusiness ? this.TITLE_DOMESTIC : this.TITLE_US_DOMESTIC;
      },
      documentation: `
        The title to be used in the card based on card type
      `
    },
    {
      class: 'String',
      name: 'info',
      expression: function(type, businessOnboarding) {
        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL && this.isCanadianBusiness ) {
          return this.DESCRIPTION_CAD_INTERNATIONAL;
        }

        if ( type === this.UnlockPaymentsCardType.INTERNATIONAL ) {
          return this.DESCRIPTION_INTERNATIONAL + this.theme.appName;
        }

        if ( businessOnboarding.signingOfficer || businessOnboarding.status !== this.OnboardingStatus.SAVED ) {
          if ( this.isCanadianBusiness ) {
            return this.DESCRIPTION_DOMESTIC;
          } else {
            return this.DESCRIPTION_US_DOMESTIC;
          }
        } else if ( ! businessOnboarding.signingOfficer && businessOnboarding.status === this.OnboardingStatus.SAVED ) {
          return this.DESCRIPTION_ONBOARDING_INCOMPLETION;
        }
      },
      documentation: `
        The description to be used in the card based on card type
      `
    },
    {
      class: 'Boolean',
      name: 'isComplete'
    },
    {
      class: 'Boolean',
      name: 'hasFXProvisionPermission'
    },
    {
      name: 'isCanadianBusiness',
      expression: function(subject) {
        return subject.user.address.countryId === 'CA';
      }
    },
    {
      class: 'Boolean',
      name: 'isEmployee'
    },
    'businessOnboarding'
  ],

  methods: [
    async function initE() {
      var self = this;
      this.hasFXProvisionPermission = await this.auth.check(null, 'fx.provision.payer');
      this.addClass(this.myClass())
        .style({ 'background-image': this.flagImgPath })
        .start().addClass(this.myClass('info-box'))
          .start('p').addClass(this.myClass('title')).add(this.title).end()
          .start('p').addClass(this.myClass('description')).add(this.info).end()
          .add(this.slot(function(isComplete, type) {
            if ( type === self.UnlockPaymentsCardType.INTERNATIONAL && ! this.isCanadianBusiness ) {
              return this.E().start().addClass(self.myClass('complete-container'))
                .start('p').addClass(self.myClass('complete')).add(self.COMING_SOON).end()
              .end();
            }
            if ( type === self.UnlockPaymentsCardType.INTERNATIONAL && this.isCanadianBusiness
                && ! this.hasFXProvisionPermission && ! this.isComplete ) {
              return this.E().start().addClass(self.myClass('complete-container'))
                .start('p').addClass(self.myClass('complete')).add(self.PENDING_TWO).end()
              .end();
            }
            if ( type === self.UnlockPaymentsCardType.INTERNATIONAL && this.isCanadianBusiness
                && this.hasFXProvisionPermission && ! this.subject.user.onboarded && ! this.isEmployee ) {
              return this.E().start().addClass(self.myClass('complete-container'))
                .start('p').addClass(self.myClass('complete')).add(self.PENDING).end()
              .end();
            }
            if ( ! isComplete && ! this.isEmployee ) {
              return this.E()
                .startContext({ data: self })
                  .start(self.GET_STARTED, { buttonStyle: 'SECONDARY' }).end()
                .endContext();
            }

            return this.E().start().addClass(self.myClass('complete-container'))
              .start({
                class: 'foam.u2.tag.Image',
                data: 'images/checkmark-small-green.svg'
              })
                .addClass(self.myClass('icon'))
              .end()
              .start('p')
                .addClass(self.myClass('complete'))
                .add(self.COMPLETE)
              .end()
            .end();
          }))
        .end();
    }
  ],

  actions: [
    {
      name: 'getStarted',
      label: 'Get started',
      code: function(x) {
          var userId = this.subject.realUser.id;
          var businessId = this.subject.user.id;
          if ( ! this.subject.user.onboarded ) {
            var isDomesticOnboarding = this.type === this.UnlockPaymentsCardType.DOMESTIC;

            // We need to find the BusinessOnboarding by checking both the
            // userId and the businessId. Previously we were only checking the
            // userId, which caused a bug when trying to add a user that's
            // already on the platform as a signing officer for another
            // business. The bug was caused by the search by userId finding the
            // BusinessOnboarding for the existing user's other business instead
            // of the one they were recently added to. By including the
            // businessId in our search criteria we avoid this problem.
            if ( isDomesticOnboarding && this.isCanadianBusiness ) {
              this.businessOnboardingDAO.find(
                this.AND(
                  this.EQ(this.BusinessOnboarding.USER_ID, userId),
                  this.EQ(this.BusinessOnboarding.BUSINESS_ID, businessId)
                )
              ).then((o) => {
                o = o || this.BusinessOnboarding.create({
                  userId: userId,
                  businessId: businessId
                });
                this.stack.push({
                  class: 'net.nanopay.sme.onboarding.ui.WizardView',
                  data: o
                });
                location.hash = 'sme.main.onboarding';
              });
            }  else if ( ! this.isCanadianBusiness ) {
              this.uSBusinessOnboardingDAO.find(
                this.AND(
                  this.EQ(this.USBusinessOnboarding.USER_ID, userId),
                  this.EQ(this.USBusinessOnboarding.BUSINESS_ID, businessId)
                )
              ).then((o) => {
                o = o || this.USBusinessOnboarding.create({
                  userId: userId,
                  businessId: businessId
                });
                this.stack.push({
                  class: 'net.nanopay.sme.onboarding.ui.WizardView',
                  data: o
                });
                location.hash = 'sme.main.onboarding';
              });
            }
          }  else if ( ! isDomesticOnboarding && this.isCanadianBusiness ) {
            this.canadaUsBusinessOnboardingDAO.find(
              this.AND(
                this.EQ(this.CanadaUsBusinessOnboarding.USER_ID, userId),
                this.EQ(this.CanadaUsBusinessOnboarding.BUSINESS_ID, businessId)
              )
            ).then((o) => {
              o = o || this.CanadaUsBusinessOnboarding.create({
                userId: userId,
                businessId: businessId
              });
              this.stack.push({
                class: 'net.nanopay.sme.onboarding.ui.WizardView',
                data: o
              });
              location.hash = 'sme.main.onboarding.international';
            });
          } else {
            this.menuDAO.find('sme.accountProfile.business-settings').then((menu) => menu.launch());
          }
      }
    }
  ]

});

foam.ENUM({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'UnlockPaymentsCardType',

  values: [
    {
      name: 'DOMESTIC',
      label: 'Domestic'
    },
    {
      name: 'INTERNATIONAL',
      label: 'International'
    }
  ]
});
