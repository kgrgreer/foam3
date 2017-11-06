foam.CLASS({
  package: 'net.nanopay',
  name: 'TempMenu',

  imports: [
    'invoiceDAO',
    'brokerDAO',
    'cicoServiceProviderDAO',
    'menuDAO',
    'nSpecDAO',
    'transactionLimitDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {

      foam.json.parse([
        {                         id: 'sign-in',       label: 'Sign in',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.auth.ui.SignInView' } } },
        {                         id: 'subscription',  label: 'Subscription',       handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.SubscriptionView' } } },
        {                         id: 'dashboard',     label: 'Dashboard',          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.InvoiceDashboardView' } } },
        {                         id: 'banks',         label: 'Banking',              handler : { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.cico.ui.CicoView' } } },
        {                         id: 'sales',         label: 'Receivable',         handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.SalesView' } } },
        {                         id: 'expenses',      label: 'Payable',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.ExpensesView' } } },
        {                         id: 'interac',       label: 'Transactions',       handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.tx.ui.TransactionsView' } } },
        {                         id: 'transfer',      label: 'Transfer',           handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.ui.TransferView' } } },
        {                         id: 'devices',       label: 'Devices',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.retail.ui.devices.DevicesView' } } },
        { /*parent: 'support',*/  id: 'aaainvoices',   label: 'Invoices',           handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
        { parent: 'admin',        id: 'brokers',       label: 'Brokers',            handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'brokerDAO' } },
        { parent: 'admin',        id: 'servproviders', label: 'Service Providers',  handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'cicoServiceProviderDAO' } },
        { parent: 'admin',        id: 'translimits',   label: 'Transaction Limits', handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'transactionLimitDAO' } },
        { parent: 'admin',        id: 'emailTemplates',label: 'Email Templates', handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'emailTemplateDAO' } },
        { parent: 'admin',        id: 'docs',          label: 'Documentation',      handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'foam.doc.DocBrowser', path: 'foam.core.Property' }  } },
        { parent: 'settings',     id: 'set-personal',     label: 'Personal', order: 30,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.settings.personal.PersonalSettingsView' } } },
        { parent: 'settings',     id: 'set-bus',          label: 'Business', order: 40,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.settings.business.BusinessSettingsView' } } },
        { parent: 'settings',     id: 'set-bank',         label: 'Bank Account',      order: 50,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' } } },
        { parent: 'settings',     id: 'set-security',     label: 'Log Out',           order: 70,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.auth.ui.SignInView'} } }
 //       { parent: 'support',  id: 'data',         label: 'View Data',                handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.DebugView' } } }
      ], foam.nanos.menu.Menu, this.__subContext__).forEach(this.menuDAO.put.bind(this.menuDAO));
    }
  ]
});
