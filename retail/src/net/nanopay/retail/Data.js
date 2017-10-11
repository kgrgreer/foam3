foam.CLASS({
  package: 'net.nanopay.retail',
  name: 'Data',

  imports: [
    'menuDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {
      this.SUPER();

      foam.json.parse([
        {                         id: 'transactions',     label: 'Transactions',      order: 10,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.retail.ui.transactions.TransactionsView' } } },
        {                         id: 'devices',          label: 'Devices',           order: 20,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.retail.ui.devices.DevicesView' } } },
        { parent: 'settings',     id: 'set-personal',     label: 'Personal Settings', order: 30,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.settings.personal.PersonalSettingsView' } } },
        { parent: 'settings',     id: 'set-bus',          label: 'Business Settings', order: 40,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.settings.business.BusinessSettingsView' } } },
        { parent: 'settings',     id: 'set-bank',         label: 'Bank Account',      order: 50,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.cico.ui.bankAccount.BankAccountSettingsView' } } },
        { parent: 'settings',     id: 'set-autoCash',     label: 'Auto Cashout',      order: 60,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.settings.autoCashout.AutoCashoutSettingsView' } } },
        { parent: 'settings',     id: 'set-security',     label: 'Log Out',           order: 70,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.retail.ui.onboarding.SignInView'} } }
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));
    }
  ]
});
