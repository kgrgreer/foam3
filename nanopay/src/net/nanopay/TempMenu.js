foam.CLASS({
  package: 'net.nanopay',
  name: 'TempMenu',

  imports: [
    'invoiceDAO',
    'brokerDAO',
    'cicoServiceProviderDAO',
    'menuDAO',
    'nSpecDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {

      foam.json.parse([
        {                         id: 'sign-in',       label: 'Sign in',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.auth.ui.SignInView' } } },
        {                         id: 'dashboard',     label: 'Dashboard',          handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.InvoiceDashboardView' } } },
        {                         id: 'banks',         label: 'Banks',              handler : { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.cico.ui.CicoView' } } },
        {                         id: 'sales',         label: 'Receivable',         handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.SalesView' } } },
        {                         id: 'expenses',      label: 'Payable',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.ExpensesView'} } },
        { /*parent: 'support',*/  id: 'aaainvoices',   label: 'Invoices',           handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
        { parent: 'admin',        id: 'brokers',       label: 'Brokers',            handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'brokerDAO' } },
        { parent: 'admin',        id: 'servproviders', label: 'Service Providers',  handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'cicoServiceProviderDAO' } },
        {                         id: 'transfer',      label: 'Transfer',           handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.ui.TransferView' } } },
        {                         id: 'devices',       label: 'Devices',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.retail.ui.devices.DevicesView' } } },
 //       { parent: 'support',  id: 'data',         label: 'View Data',                handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.DebugView' } } }
      ], foam.nanos.menu.Menu, this.__subContext__).forEach(this.menuDAO.put.bind(this.menuDAO));
    }
  ]
});
