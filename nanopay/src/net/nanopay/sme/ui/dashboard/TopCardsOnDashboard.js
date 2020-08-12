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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'TopCardsOnDashboard',
  extends: 'foam.u2.Controller',

  documentation: `
    View to display new(May 21 2019) zeplin designs for dashboard
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard',
    'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard',
    'net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard',
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard',
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'accountingIntegrationUtil',
    'businessDAO',
    'businessOnboardingDAO',
    'businessInvitationDAO',
    'canadaUsBusinessOnboardingDAO',
    'isIframe',
    'subject',
    'userDAO'
  ],

  css: `
  ^ .cards {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
  }
  ^ .lower-cards {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    width: 100%;
    justify-content: space-between;
  }
  ^ .divider {
    background-color: #e2e2e3;
    height: 2px;
    margin: 24px 0 0 0;
    width: 97%;
  }
  ^ .subTitle {
    color: #8e9090;
    font-size: 16px;
  }
  ^ .radio-as-arrow-margins {
    float: right;
    margin-top: -12px;
  }
  ^ .radio-as-arrow {
    border-style: solid;
    border-width: 0 4px 5px 4px;
    border-color: transparent transparent white transparent;
    position: relative;
    left: 13px;
    top: 6px;
    z-index: 0;
    pointer-events:none;
  }
  ^ .radio-as-arrow-down {
    border-style: solid;
    border-width: 5px 4px 0 4px;
    border-color: white transparent transparent transparent;
    position: relative;
    left: 13px;
    top: 7px;
    z-index: 0;
    pointer-events:none;
  }
  ^ .foam-u2-CheckBox {
    -webkit-appearance: none;
    background-color: /*%PRIMARY3%*/ #406dea;
    border-radius: 50%;
    z-index: 10000;
  }
  ^ .foam-u2-CheckBox:checked:after {
    content: none;
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hidePaymentCards',
      label: '',
      documentation: 'The clickable arrow under the title, that toggles the onboarding cards.'
    },
    'bankAccount',
    'userHasPermissionsForAccounting',
    'businessOnboarding',
    'onboardingStatus',
    'businessRegistrationDate',
    'countryOfBusinessRegistration',
    {
      class: 'Boolean',
      name: 'complete',
      value: false,
      expression: function(businessOnboarding, businessRegistrationDate, countryOfBusinessRegistration) {
        return businessOnboarding && businessRegistrationDate && countryOfBusinessRegistration;
      }
    }
  ],

  messages: [
    { name: 'LOWER_LINE_TXT', message: 'Welcome back' }
  ],

  methods: [
    async function init() {
      let business = await this.businessDAO.find(this.subject.user.id);
      this.onboardingStatus = business.onboarded;
      this.countryOfBusinessRegistration = business.countryOfBusinessRegistration;
      this.businessRegistrationDate = business.businessRegistrationDate;
    },
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('subTitle').add(this.LOWER_LINE_TXT +' '+ this.subject.user.toSummary() + '!').end()
            .start().addClass('divider').end()
            .start().addClass('radio-as-arrow-margins').add(this.HIDE_PAYMENT_CARDS).end()
            .start().addClass('radio-as-arrow-margins').addClass(this.hidePaymentCards$.map((hide) => hide ? 'radio-as-arrow' : 'radio-as-arrow-down')).end()
            .start().addClass('cards').hide(this.hidePaymentCards$)
              .start('span')
                .add(this.slot((subject$user$onboarded, businessOnboarding) => {
                  return this.E().start().tag({ class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard', type: this.UnlockPaymentsCardType.DOMESTIC, isComplete: subject$user$onboarded, businessOnboarding: businessOnboarding }).end();
                }))
              .end()
              .start('span')
                .hide(this.isIframe())
                .addClass('us-business-onboarding')
                .add(this.slot((subject$user$onboarded, businessOnboarding, complete) => {
                  let isEmp = subject$user$onboarded && this.businessOnboarding && ! this.businessOnboarding.signingOfficer && this.businessOnboarding.status === this.OnboardingStatus.SUBMITTED;
                  return this.E()
                    .start()
                    .tag({
                      class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard',
                      type: this.UnlockPaymentsCardType.INTERNATIONAL,
                      isComplete: complete,
                      isEmployee: isEmp,
                      businessOnboarding: businessOnboarding
                    })
                    .end();
                }))
              .end()
            .end()
        .start().addClass('lower-cards')
          .start('span')
            .add(this.slot((bankAccount) => {
              return this.E().start().tag({ class: 'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard', account: bankAccount }).end();
            }))
          .end()
          .start('span')
            .hide(this.isIframe())
            .addClass('accounting-software')
            .add(this.slot((subject$user$hasIntegrated) => {
              return this.E().start().tag({ class: 'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard', hasPermission: this.userHasPermissionsForAccounting && this.userHasPermissionsForAccounting[0], hasIntegration: subject$user$hasIntegrated }).end();
            }))
          .end()
        .end();
    }
  ]
});
