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
        { id: 'home',         label: 'Home',         order: 10, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.TransactionsView' } } },
        { id: 'aaainvoices', label: 'Invoices', order: 11, handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
        { id: 'manage-payee', label: 'Manage Payee', order: 12, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.ManagePayeeView' } } },
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));
    

      var MS_PER_DAY = 1000 * 3600 * 24;
      
      this.__context__.userDAO.select().then(function (bs) {
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