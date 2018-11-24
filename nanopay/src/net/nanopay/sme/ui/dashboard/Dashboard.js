foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.Element',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.account.Account',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'menuDAO',
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
    { name: 'SUBTITLE1', message: 'Action Required' },
    { name: 'SUBTITLE2', message: 'Recent Payables' },
    { name: 'SUBTITLE3', message: 'Latest Activity' },
    { name: 'SUBTITLE4', message: 'Recent Receivables' },
    { name: 'VIEW_ALL', message: 'View all' }
  ],

  css: `
    ^separate {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ^clickable {
      cursor: pointer;
      font-size: 16px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOReceivables',
      factory: function() {
        return this.user.sales
          .orderBy(this.DESC(this.Invoice.LAST_MODIFIED))
          .limit(5);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOPayables',
      factory: function() {
        return this.user.expenses
          .orderBy(this.DESC(this.Invoice.LAST_MODIFIED))
          .limit(5);
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
      var self = this;
      var split = this.DashboardBorder.create();

      var top = this.Element.create()
        .start('h1')
          .add(this.TITLE)
        .end()
        .tag({ class: 'net.nanopay.sme.ui.dashboard.DynamicSixButtons' });

      var topL = this.Element.create()
        .start('h2')
          .add(this.SUBTITLE1)
        .end()
        .tag(this.RequireActionView.create());

      var topR = this.Element.create()
        .start()
          .addClass(this.myClass('separate'))
          .start('h2')
            .add(this.SUBTITLE2)
          .end()
          .start('span')
            .addClass(this.myClass('clickable'))
            .add(this.VIEW_ALL)
            .on('click', function() {
              self.menuDAO
                .find('sme.main.invoices.payables')
                .then((menu) => menu.launch());
            })
          .end()
        .end()
        .start()
          .addClass('invoice-list-wrapper')
          .select(this.myDAOPayables$proxy, (invoice) => {
            return this.E().start({
              class: 'net.nanopay.sme.ui.InvoiceRowView',
              data: invoice
            })
              .on('click', () => {
                this.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: invoice,
                  isPayable: true
                });
              })
            .end();
          })
        .end();

      var botL = this.Element.create()
        .start('h2')
          .add(this.SUBTITLE3)
        .end()
        .start()
          .select(this.myDaoNotification$proxy, function(notif) {
            return this.E().start({
              class: 'net.nanopay.sme.ui.dashboard.NotificationDashboardView',
              data: notif
            })
              .on('click', function() {
                // Do something with the notification if you want.
              })
            .end();
          })
        .end();

      var botR = this.Element.create()
        .start()
          .addClass(this.myClass('separate'))
          .start('h2')
            .add(this.SUBTITLE4)
          .end()
          .start('span')
            .addClass(this.myClass('clickable'))
            .add(this.VIEW_ALL)
            .on('click', function() {
              self.menuDAO
                .find('sme.main.invoices.receivables')
                .then((menu) => menu.launch());
            })
          .end()
        .end()
        .start()
          .addClass('invoice-list-wrapper')
          .select(this.myDAOReceivables$proxy, (invoice) => {
            return this.E().start({
              class: 'net.nanopay.sme.ui.InvoiceRowView',
              data: invoice
            })
              .on('click', () => {
                this.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: invoice
                });
              })
            .end();
          })
        .end();

      split.topButtons.add(top);
      split.leftTopPanel.add(topL);
      split.leftBottomPanel.add(botL);
      split.rightTopPanel.add(topR);
      split.rightBottomPanel.add(botR);

      this.addClass(this.myClass()).add(split).end();
    }
  ]
});
