foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  requires: [
    //'foam.nanos.notification.Notification',
    //'foam.nanos.notification.NotificationRowView',
    'foam.u2.Element',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.DynamicSixButtons',
  ],

  imports: [
    'notificationDAO',
    'user'
  ],

  exports: [
    'myDaoNotification'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'TITLE', message: 'Dashboard' },
    { name: 'SUBTITLE1', message: 'Items Requirting Action' },
    { name: 'SUBTITLE2', message: 'Recent Payables' },
    { name: 'SUBTITLE3', message: 'Latest Activity' },
    { name: 'SUBTITLE4', message: 'Recent Receivables' },
  ],

  properties: [
    {
      name: 'verE',
      class: 'Boolean'
    },
    {
      name: 'addB',
      class: 'Boolean'
    },
    {
      name: 'sync',
      class: 'Boolean'
    },
    {
      name: 'addC',
      class: 'Boolean'
    },
    {
      name: 'busP',
      class: 'Boolean'
    },
    {
      name: 'addU',
      class: 'Boolean'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOReceivables',
      factory: function() {
        return this.user.sales.limit(5);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOPayables',
      factory: function() {
        return this.user.expenses.limit(5);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDaoNotification',
      factory: function() {
        return this.notificationDAO;//.limit(5);
      },
      tableView: { class: 'foam.u2.Scroller' },
    },
    
  ],

  methods: [
    function initE() {
      this.SUPER();
      var split = net.nanopay.sme.ui.dashboard.DashboardBorder.create();

      var top = this.Element.create().add(this.TITLE).tag(
        this.DynamicSixButtons.create(
        {
          verifyEmailBo: this.verE, addBankBo: this.addB,
          syncAccountingBo: this.sync, addContactsBo: this.addC,
          busProfileBo: this.busP, addUsersBo: this.addU
        }));

      var topL = this.Element.create().add(this.SUBTITLE1).style({ 'font-size': '10px' })
        .select(this.myDAOPayables$proxy, function(invoice) {
          return topL.E().start({
            class: 'net.nanopay.sme.ui.InvoiceRowView',
            data: invoice
          })
            .on('click', function() {
              // Do something with the invoice if you want.
            })
          .end();
        });

      var topR = this.Element.create().start().add(this.SUBTITLE2).style({ 'margin-bottom': '15px' }).end()
        .start().style({ 'font-size': '12px' }).select(this.myDAOPayables$proxy, function(invoice) {
        return this.E().start({
          class: 'net.nanopay.sme.ui.InvoiceRowView',
          data: invoice
        })
          .on('click', function() {
            // Do something with the invoice if you want.
          })
        .end();
      }).end();

      var botLTitle = this.Element.create()
      .start()
        .add(this.SUBTITLE3).style({ 'margin-top': '30px', 'margin-bottom': '15px' })
      .end();

      var botL = this.Element.create()
        .start()
          .style({ 'font-size': '14px', 'font-family': 'monospace' }).select(this.myDaoNotification$proxy, function(notif) {
          return this.E().start({
            class: 'net.nanopay.sme.ui.dashboard.NotificationDashboardView',
            data: notif
          })
          .on('click', function() {
            // Do something with the invoice if you want.
          })
        .end();
      }).end();

      var botR = this.Element.create()
      .start().add(this.SUBTITLE4).style({ 'margin-top': '30px', 'margin-bottom': '15px' }).end()
        .start().style({ 'font-size': '12px' }).select(this.myDAOReceivables$proxy, function(invoice) {
        return this.E().start({
          class: 'net.nanopay.sme.ui.InvoiceRowView',
          data: invoice
        })
          .on('click', function() {
            // Do something with the invoice if you want.
          })
        .end();
      }).end();

      split.topButtons.add(top);
      split.leftTopPanel.add(topL);
      split.leftBottomPanel.add(botL);
      split.rightTopPanel.add(topR);
      split.rightBottomPanel.add(botR);
      split.leftBottomTitle.add(botLTitle);

      this.addClass(this.myClass()).add(split);
    }
  ]
});
