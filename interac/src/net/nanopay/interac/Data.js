/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Data',

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  imports: [
    'businessDAO',
    'invoiceDAO',
    'menuDAO',
    'country',
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

//      this.__context__.businessDAO.select().then(function (bs) {
//        var l = bs.array.length;
//
//        // Use own random() function rather than Math.random() so we always get
//        // the same results.
//        var r = 16;
//        var random = function() {
//          r = ((r * 7621) + 1) % 32768;
//          return r / 32768;
//        };
//
//        for ( var i = 0 ; i < 5000 ; i++ ) {
//          var fi       = 0;
//          var ti       = Math.floor(random()*70);
//          var dd       = new Date(Date.now() - 2*360*MS_PER_DAY*(random()-0.1));
//          var amount   = Math.floor(Math.pow(10,3+random()*4))/100;
//          var fromUser = bs.array[fi];
//          var toUser   = bs.array[ti];
//          var inv = this.Invoice.create({
//            draft:            random()<0.002,
//            invoiceNumber:    10000+i,
//            purchaseOrder:    10000+i,
//            payerId:   fromUser.id,
//            payeeId:     toUser.id,
//            issueDate:        dd,
//            amount:           amount
//          });
//          if ( random() < 0.025 ) {
//            inv.paymentId = -1;
//          } else if ( random() < 0.97 ) {
//            inv.paymentDate = new Date(inv.issueDate.getTime() - ( 7 + random() * 60 ) * MS_PER_DAY);
//            if ( inv.paymentDate < Date.now() ) {
//              inv.paymentId = inv.invoiceNumber;
//            }
//          }
//
//          this.invoiceDAO.put(inv);
//        }
//      }.bind(this));
    }
  ]
});
