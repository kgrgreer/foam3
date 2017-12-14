foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'SettingsNavigator',
  extends: 'foam.u2.View',

  imports: [ 'stack' ],

  documentation: 'View to navigate between setting pages.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .settingsBar {
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #FFFFFF;
          margin-bottom: 20px;
        }

        ^ .settingsBarContainer {
          width: 992px;
          margin: auto;
        }

        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.3px;
          color: #093649;
          padding: 0;
          padding-left: 30px;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 40px;
        }

        ^ .foam-u2-ActionView:first-child {
          padding-left: 0;
        }

        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }
       ^ .foam-nanos-menu-SubMenuView-inner::after {
          content: ' ';
          position: absolute;
          height: 0;
          width: 0;
          border: 8px solid transparent;
          border-bottom-color: white;
          -ms-transform: translate(130px, -175.5px);
          transform: translate(130px, -336px);
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())

        .start('div').addClass('settingsBar')
          .start('div').addClass('settingsBarContainer')
            .add(this.PERSONAL_PROFILE)
            .add(this.CHANGE_PASSWORD)
            .add(this.PREFERENCES)
            .add(this.BUSINESS_PROFILE)
            .add(this.BANK_ACCOUNTS)
            .add(this.MULT_USER_MANAGEMENT)
            .add(this.INTEGRATION_MANAGEMENT)            
            .add(this.CASH_OUT)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'personalProfile',
      label: 'Personal Profile',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.PersonalProfileView' });
      }
    },
    {
      name: 'businessProfile',
      label: 'Business Profile',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.business.BusinessProfileView' });
      }
    },
    {
      name: 'bankAccounts',
      label: 'Bank Account',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.bankAccount.BankAccountsView' });
      }
    },
    {
      name: 'changePassword',
      label: 'Change Password',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.ChangePasswordView' });
      }
    },
    {
      name: 'preferences',
      label: 'Preferences',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.PreferenceView' });
      }
    },
    {
      name: 'multiUserManagement',
      label: 'Multi-User',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.MultiUserManagementView' });
      }
    },
    {
      name: 'integrationManagement',
      label: 'Integration',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.IntegrationView' });
      }
    },
    {
      name: 'cashOut',
      label: 'Cash Out',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.settings.autoCashout.AutoCashoutSettingsView' });
      }
    }
  ]
});
