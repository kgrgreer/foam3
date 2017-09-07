foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Data',

  imports: [
    'invoiceDAO',
    'menuDAO'
  ],

  methods: [
    function init() {
      this.SUPER();

      foam.json.parse([
        { id: 'home',         label: 'Home',         order: 10, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.CanadaTransactionsView' } } },
        { id: 'aaainvoices', label: 'Invoices', order: 11, handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
        { id: 'manage-payee', label: 'Manage Payee', order: 12, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.ManagePayeeView' } } },
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));
    }
  ]
});