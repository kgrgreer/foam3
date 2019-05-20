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
    'net.nanopay.sme.ui.dashboard.RequireActionView',
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard',
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType',
    'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard',
    'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard',
    'net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard'
  ],

  imports: [
    'accountDAO',
    'accountingIntegrationUtil',
    'businessOnboardingDAO',
    'user',
    'userDAO'
    ],

  css: `
  ^ .cards {
    margin-top: 20px;
    display: inline-flex;
  }
  ^ .cards {
    //margin-top: 20px;
    display: inline-flex;
    width: 100%;
  }
  ^ .inner-card {
    margin-left: 20px;
  }
  ^ .divider {
    background-color: #e2e2e3;
    height: 2px;
    margin: 24px 0 0 0;
    width: 97%;
  }
  ^ .divider-half {
    background-color: #e2e2e3;
    height: 2px;
    margin: 24px 0 0 0;
    width: 41%;
  }
  ^ .subTitle {
    color: #8e9090;
    font-size: 16px;
  }
  ^ .radio-as-arrow {
    float: right;
    margin-top: -12px;
  } 
  // background-color: #604aff;
  ^ .foam-u2-CheckBox {
    -webkit-appearance: none;
    border-radius: 2px;
    border: solid 1px #604aff;
    box-sizing: border-box;
    display: inline-block;
    fill: #604aff;

    vertical-align: middle;

    height: 16px;
    width: 16px;

    opacity: 1;

    transition: background-color 140ms, border-color 140ms;
  }

  ^ .foam-u2-CheckBox:checked {
    background-color: #604aff;
    fill: white;
    border: solid 1px ##604aff;
  }

  ^ .foam-u2-CheckBox:checked:after {
    content: url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2048%2048%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2215%22%20height%3D%2215%22%20version%3D%221.1%22%3E%0A%20%20%20%3Cpath%20fill%3D%22white%22%20stroke-width%3D%223%22%20d%3D%22M18%2032.34L9.66%2024l-2.83%202.83L18%2038l24-24-2.83-2.83z%22/%3E%0A%3C/svg%3E);
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hidePaymentCards',
      documentation: 'This the clickable arrow under the title, that toggles the onboarding cards.'
    }
  ],

  methods: [
    async function initE() {
      Promise.all([
        this.user.accounts
          .where(
            this.AND(
              this.OR(
                this.EQ(this.Account.TYPE, this.BankAccount.name),
                this.EQ(this.Account.TYPE, this.CABankAccount.name),
                this.EQ(this.Account.TYPE, this.USBankAccount.name)
              ), this.EQ(this.Account.Owner, this.user.id)
            )
          ).select().then((result) => result),
        this.accountingIntegrationUtil.getPermission(),
        this.userDAO.find(this.user.id).then((use) => use.hasIntegrated),
        this.businessOnboardingDAO.find(this.user.id).then((o) => o.signingOfficer),
        this.user.onboarded,
        this.accountDAO.select().then((bb)=>bb.array)
      ]).then((values) => {
          // REFERENCE FOR values
          // bankAccount                     = values[0];
          // userHasPermissionForAccounting  = values[1];
          // userHasIntegratedWithAccounting = values[2];
          // isSigningOfficer                = values[3];
          // isOnboardingCompleted           = values[4];
          debugger;
          values[5];
          let account =  values[0] && values[0].array[0];
          let accountVerified = account && account.status == this.BankAccountStatus.VERIFIED;
          let isBankCompleted = account && account.id != 0 && accountVerified;
          let isAllCompleted  = values[4] && isBankCompleted && values[2];
          let sectionsShowing = values[3] && isAllCompleted; // convience boolean for displaying certian sections
          this
            .addClass(this.myClass())
            .start().addClass('subTitle').add('Welcome back ' + this.user.label() + '!').end()

              .callIf(! values[3] && ! isAllCompleted, () => {
                this.start()
                  .addClass('divider')
                .end()
                .start().addClass('radio-as-arrow')
                  .add(this.HIDE_PAYMENT_CARDS)
                .end()
                .start().addClass('cards').hide(this.hidePaymentCards$)
                  .start('span')
                    .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard', type: this.UnlockPaymentsCardType.DOMESTIC, isComplete: values[4] })
                  .end()
                  .start('span').addClass('inner-card')
                    .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard', type: this.UnlockPaymentsCardType.INTERNATIONAL })
                  .end()
                .end();
              })

              .callIf(sectionsShowing, () => {
                this.start('span').addClass('card')
                  .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard' })
                .end();
              })

              .callIf(! sectionsShowing, () => {
                this.start().addClass('cards')
                  .start('span')
                    .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard', account: account, isAccountVerified: accountVerified })
                  .end()
                  .start('span').addClass('inner-card')
                    .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard', hasPermission: values[1] && values[1][0], hasIntegration: values[2] })
                  .end()
                .end();
              })

            .end();
        });

      // INTEGRATION
      // if ( values[1] ) {
      //   this.maximumNumberOfSteps = 4;
      //   this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
      //     completed: values[2],
      //     act: this.SYNC_ACCOUNTING <- confirm this //TODO
      //   }));
      // } else if ( this.user.hasIntegrated ) {
      //   this.completedCount--;
      // }
    },
  ]
});
