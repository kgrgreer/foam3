foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.Element',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.account.Account',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.DynamicSixButtons',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'notificationDAO',
    'stack',
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
    { name: 'SUBTITLE1', message: 'Items Requiring Action' },
    { name: 'SUBTITLE2', message: 'Recent Payables' },
    { name: 'SUBTITLE3', message: 'Latest Activity' },
    { name: 'SUBTITLE4', message: 'Recent Receivables' },
  ],

  properties: [
    {
      name: 'verE',
      class: 'Boolean',
      factory: function() {
        return this.user.emailVerified;
      }
    },
    {
      name: 'addB',
      class: 'Boolean',
      factory: function() {
        this.user.accounts.select(this.COUNT()).then(
          (c) => {
            this.addB = (c.value > 0);
          }
        );
      }
    },
    {
      name: 'sync',
      class: 'Boolean'
    },
    {
      name: 'addC',
      class: 'Boolean',
      factory: function() {
        this.user.contacts.select(this.COUNT()).then(
          (c) => {
            this.addC = (c.value > 0);
          }
        );
      }
    },
    {
      name: 'busP',
      class: 'Boolean',
      factory: function() {
        return this.user.compliance != this.ComplianceStatus.PASSED;
      }
    },
    {
      name: 'addU',
      class: 'Boolean',
      factory: function() {
        // TODO Fix below code
        // Generated Error = `Uncaught TypeError: this.user.agents.select is not a function`
        // this.user.agents.select(this.COUNT()).then(
        //   (c) => {
        //     this.addU = (c.value > 0);
        //   }
        // );
      }
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
        return this.notificationDAO.where(
          this.OR(
            this.EQ(this.Notification.USER_ID, this.user.id),
            this.EQ(this.Notification.GROUP_ID, this.user.group),
            this.EQ(this.Notification.BROADCASTED, true)
          )
        );
      }
    }
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

      var topL = this.Element.create().add(this.SUBTITLE1).style({ 'font-size': '16px' })
        .tag(this.RequireActionView.create());

      var topR = this.Element.create().start().add(this.SUBTITLE2).style({ 'margin-bottom': '15px' }).end();
        topR.start().style({ 'font-size': '12px' }).select(this.myDAOPayables$proxy, (invoice) => {
          return this.E().start({
            class: 'net.nanopay.sme.ui.InvoiceRowView',
            data: invoice
          })
          .on('click', () => {
           this.stack.push({ class: 'net.nanopay.sme.ui.InvoiceDetailView', invoice: invoice });
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
            // Do something with the notification if you want.
          })
        .end();
      }).end();

      var botR = this.Element.create()
      .start().add(this.SUBTITLE4).style({ 'margin-top': '30px', 'margin-bottom': '15px' }).end()
        .start().style({ 'font-size': '12px' }).select(this.myDAOReceivables$proxy, (invoice) => {
        return this.E().start({
          class: 'net.nanopay.sme.ui.InvoiceRowView',
          data: invoice
          })
          .on('click', () => {
            this.stack.push({ class: 'net.nanopay.sme.ui.InvoiceDetailView', invoice: invoice });
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
