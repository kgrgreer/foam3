foam.CLASS({
  package: 'net.nanopay.admin.ui.settings',
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
          line-height: 0.86;
          background-color: #FFFFFF;
          margin-bottom: 30px;
        }
        ^ .settingsBarContainer {
          width: 100%;
          margin: auto;
        }
        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.4px;
          color: #093649;
          padding: 0;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 0.86;
        }
        ^ .foam-u2-ActionView:first-child {
          padding-left: 0;
        }
        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }
        ^ .foam-u2-ActionView-bankAccount{
          margin-left: 30.5px;
          margin-right: 40px;
          line-height: 40px;
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
            .add(this.BANK_ACCOUNT)
            .add(this.CHANGE_PASSWORD)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'bankAccount',
      label: 'Bank Account',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.admin.ui.settings.bankAccount.BankAccountSettingsView' });
      }
    },
    {
      name: 'changePassword',
      label: 'Change Password',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.admin.ui.settings.changePassword.ChangePassword' });
      }
    }
  ]
});
