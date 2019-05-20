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
    'accountingIntegrationUtil',
    'businessOnboardingDAO',
    // 'agent',
    // 'menuDAO',
    // 'pushMenu',
    // 'notify',
    // 'stack',
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
    },
    {
      class: 'Boolean',
      name: 'isEmployee',
      documentation: 'This is for toggling the cards.'
    },
    {
      class: 'Boolean',
      name: 'isCompleted',
      documentation: 'This is for understanding if we have finished the onboarding.'
    },
    {
      class: 'Boolean',
      name: 'isAllCompleted',
      documentation: 'This is for understanding if we have cpmpleted onboarding, adding a bank and syncing with accounting.',
      // expression: function(isEmployee, isCompleted) {
      //   return isEmployee;// ||
      // }
    },
    {
      class: 'Boolean',
      name: 'isBankCompleted'
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
              ), this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
            )
          ).select().then((result) => result),
        this.accountingIntegrationUtil.getPermission(),
        this.userDAO.find(this.user.id).then((use) => use.hasIntegrated),
        this.businessOnboardingDAO.find(this.user.id).then((o) => o.signingOfficer),
        this.user.onboarded
      ]).then((values) => {
          this.isEmployee = values[3];
          this.isCompleted = values[4];
          this.isBankCompleted = values[0] && values[0].id != 0;
          this.isAllCompleted = this.isCompleted && this.isBankCompleted && values[2];
          this
            .addClass(this.myClass())
            .start().addClass('subTitle').add('Welcome back ' + this.user.label() + '!').end()
    
            .start().hide(this.isEmployee$)
    
              .start()
                .addClass('divider')
              .end()
              .start().addClass('radio-as-arrow')
                .add(this.HIDE_PAYMENT_CARDS)
              .end()
    
              .start().addClass('cards').hide(this.hidePaymentCards$)
    
                .start('span')
                  .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard', type: this.UnlockPaymentsCardType.DOMESTIC, isComplete: this.isCompleted })
                .end()
                .start('span').addClass('inner-card')
                  .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCard', type: this.UnlockPaymentsCardType.INTERNATIONAL })
                .end()
    
              .end()
    
              .start().addClass('cards')
                .start('span')
                  .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard', account: values[0], isErrored: false, isLoading: false })
                .end()
                .start('span').addClass('inner-card')
                  .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard', hasPermission: values[1], hasIntegration: values[2] })
                .end()
              .end()
    
            .end()
    
            .start().show(this.isEmployee$)
    
              .start('span').addClass('card').hide(this.isCompleted$)
    
                .tag({ class: 'net.nanopay.sme.ui.dashboard.cards.SigningOfficerSentEmailCard',  })
              .end()
              .start().addClass('card').show(this.isCompleted$)
                .start('span')
                  .start(this.BankIntegrationCard).end()
                .end()
                .start('span').addClass('inner-card')
                  .start(this.QBIntegrationCard).end()
                .end()
    
              .end()
    
            .end()
    
            .start().addClass('cards')
              .start()
                .addClass('divider-half')
              .end()
              .start('span')
                .add('Your latest Ablii items')
              .end()
              .start()
                .addClass('divider-half')
              .end()
            .end();
        });

      // INTEGRATION
      // if ( values[1] ) {
      //   this.maximumNumberOfSteps = 4;
      //   this.actionsDAO.put(net.nanopay.sme.ui.dashboard.ActionObject.create({
      //     completed: values[2],
      //     act: this.SYNC_ACCOUNTING
      //   }));
      // } else if ( this.user.hasIntegrated ) {
      //   this.completedCount--;
      // }
    },
  ],

  // actions: [
  //   {
  //     name: 'verifyEmail',
  //     label: 'Verify Email',
  //     code: function() {
  //       // TODO
  //     }
  //   },
  //   {
  //     name: 'addBank',
  //     label: 'Add Banking',
  //     icon: 'images/bank_icon.svg',
  //     code: function() {
  //       if ( this.bankAction.completed ) {
  //         this.notify(this.SINGULAR_BANK, 'warning');
  //       } else {
  //         this.menuDAO
  //           .find('sme.main.banking')
  //           .then((menu) => menu.launch());
  //       }
  //     }
  //   },
  //   {
  //     name: 'syncAccounting',
  //     label: 'Sync Accounting',
  //     icon: 'images/ablii/sync-resting.svg',
  //     code: function() {
  //       this.add(this.Popup.create().tag({
  //         class: 'net.invoice.ui.modal.IntegrationModal'
  //       }));
  //     }
  //   },
  //   {
  //     name: 'addContacts',
  //     label: 'Add Contacts',
  //     code: function() {
  //       this.menuDAO
  //         .find('sme.main.contacts')
  //         .then((menu) => menu.launch());
  //     }
  //   },
  //   {
  //     name: 'busProfile',
  //     label: 'Business Profile',
  //     icon: 'images/Briefcase_Icon.svg',
  //     code: function(x) {
  //       if ( ! this.user.onboarded ) {
  //         var userId = this.agent.id;
  //         var businessId = this.user.id;
  //         x.businessOnboardingDAO.find(businessId).then((o) => {
  //           o = o || this.BusinessOnboarding.create({
  //             userId: userId,
  //             businessId: businessId
  //           });
  //           this.stack.push({
  //             class: 'net.nanopay.sme.onboarding.ui.WizardView',
  //             data: o
  //           });
  //         });
  //       } else {
  //         this.menuDAO.find('sme.accountProfile.business-settings').then((menu) => menu.launch());
  //       }
  //     }
  //   },
  // ]
});
