foam.CLASS({
  package: 'net.nanopay.b2b',
  name: 'Data',

  imports: [
    'invoiceDAO',
    'menuDAO',
    'nSpecDAO'
  ],

  documentation: 'Temporary menu data.',

  methods: [
    function init() {
      this.SUPER();

      foam.json.parse([
        {                         id: 'sign-in',          label: 'Sign in',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'foam.nanos.auth.SignInView' } } },
        {                         id: 'dashboard',        label: 'Dashboard',                      handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.dashboard.DashboardView' } } },
        {                         id: 'sales',            label: 'Receivable',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.receivables.SalesView' } } },
        {                         id: 'history',          label: 'History',                        handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.history.HistoryView' } } },
        {                         id: 'expenses',         label: 'Payable',                     handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.payables.ExpensesView'} } },
        {                         id: 'partners',         label: 'Partners',                       handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.partners.PartnersView'} } },
        { parent: 'settings',     id: 'set-account',      label: 'Personal Settings', order: 10,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.settings.AccountSettingsView' } } },
        { parent: 'settings',     id: 'set-bus',          label: 'Business Settings',  order: 20,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.settings.BusinessSettingsView' } } },
        { parent: 'settings',     id: 'set-bank',         label: 'Fee/Plan',          order: 30,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.ui.settings.BankAccountSettingsView' } } },
        { parent: 'settings',     id: 'set-security',     label: 'Log Out',           order: 40,   handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'foam.nanos.auth.SignOutView'}  } },
        { /*parent: 'support',*/  id: 'aaainvoices',      label: 'Invoices',                       handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
 //       { parent: 'support',  id: 'data',         label: 'View Data',            handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.b2b.DebugView' } } }
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));

      var MS_PER_DAY = 1000 * 3600 * 24;

      this.__context__.businessDAO.select().then(function (bs) {
        var l = bs.array.length;

        for ( var i = 0 ; i < 1000 ; i++ ) {
          var fi = 100+Math.floor(Math.random()*l);
          var ti = 100+Math.floor(Math.random()*l);
          var dd = new Date(Date.now() - 2*360*MS_PER_DAY*(Math.random()-0.1));
          var amount = Math.floor(Math.pow(10,3+Math.random()*4))/100;

          if ( ti === fi ) ti = ti === 100 ? 101 : ti-1;
          var inv = net.nanopay.b2b.model.Invoice.create({
            draft:            Math.random()<0.002,
            invoiceNumber:    10000+i,
            purchaseOrder:    10000+i,
            fromBusinessId:   fi,
            toBusinessId:     ti,
            fromBusinessName: bs.array[fi-100].name,
            toBusinessName:   bs.array[ti-100].name,
            issueDate:        dd,
            amount:           amount
          });

          if ( Math.random() < 0.005 ) {
            inv.paymentId = -1;
          } else if ( Math.random() < 0.97 ) {
            inv.paymentDate = new Date(inv.issueDate.getTime() - ( 7 + Math.random() * 60 ) * MS_PER_DAY);
            if ( inv.paymentDate < Date.now() ) {
              inv.paymentId = inv.invoiceNumber;
            }
          }

          this.invoiceDAO.put(inv);
        }
      }.bind(this));
    }
  ]
});
