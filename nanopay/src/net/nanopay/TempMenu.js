foam.CLASS({
  package: 'net.nanopay',
  name: 'TempMenu',

  imports: [
    'menuDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {
      this.SUPER();

      foam.json.parse([
        {                         id: 'sign-in',          label: 'Sign in',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.ui.SignInView' } } },
        {                         id: 'dashboard',        label: 'Dashboard',                      handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.DashboardView' } } },
        {                         id: 'sales',            label: 'Receivable',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.receivables.SalesView' } } },
        {                         id: 'expenses',         label: 'Payable',                     handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.invoice.ui.payables.ExpensesView'} } },
        // { /*parent: 'support',*/  id: 'aaainvoices',      label: 'Invoices',                       handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));

    }
  ]
});