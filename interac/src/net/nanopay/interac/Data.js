foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Data',

  imports: [
    'invoiceDAO',
    'menuDAO',
    'country'
  ],

  methods: [
    function init() {
      this.SUPER();

      var countryView;

      if(this.country == 'Canada') {
        countryView = { id: 'home',         label: 'Home',         order: 10, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.CanadaTransactionsView' } } }
      } else if (this.country == 'India') {
        countryView = { id: 'home',         label: 'Home',         order: 10, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.IndiaTransactionsView' } } }
      }

      foam.json.parse([
        countryView,
        { id: 'aaainvoices', label: 'Invoices', order: 11, handler: { class: 'foam.nanos.menu.DAOMenu',  daoKey: 'invoiceDAO' } },
        { id: 'manage-payee', label: 'Manage Payee', order: 12, handler: { class: 'foam.nanos.menu.ViewMenu', view: { class: 'net.nanopay.interac.ui.ManagePayeeView' } } },
      ], foam.nanos.menu.Menu, this.__context__).forEach(this.menuDAO.put.bind(this.menuDAO));

      var MS_PER_DAY = 1000 * 3600 * 24;
      
      this.__context__.userDAO.select().then(function (bs) {
        var l = bs.array.length;

        for ( var i = 0 ; i < 1000 ; i++ ) {
          var fi = 2;
          var ti = 1;
          var dd = new Date(Date.now() - 2*360*MS_PER_DAY*(Math.random()-0.1));
          var amount = Math.floor(Math.pow(10,3+Math.random()*4))/100;
          var fromUser = bs.array[1];
          var toUser = bs.array[0];
          if ( ti === fi ) ti = ti === 100 ? 101 : ti-1;
          var inv = net.nanopay.b2b.model.Invoice.create({
            draft:            Math.random()<0.002,
            invoiceNumber:    10000+i,
            purchaseOrder:    10000+i,
            fromBusinessId:   fi,
            toBusinessId:     ti,
            fromBusinessName: fromUser.organization || (fromUser.firstName + ' ' + fromUser.lastName),
            toBusinessName:  toUser.organization || (toUser.firstName + ' ' + toUser.lastName),
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