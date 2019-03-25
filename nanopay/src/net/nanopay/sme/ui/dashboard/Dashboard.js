foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.account.Account',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'notificationDAO',
    'pushMenu',
    'stack',
    'user',
    'xeroService',
    'quickbooksService'
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
    ^ .invoice-empty-state {
      text-align: center;
      padding: 27px;
      border: 1px solid #e2e2e3;
      background: #fff;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      font-size: 14px;
      line-height: 25px;
      color: #8e9090;
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
    },
    {
      class: 'Int',
      name: 'payablesCount',
      factory: function() {
        this.user.expenses
          .select(this.COUNT()).then((c) => {
            this.payablesCount = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'receivablesCount',
      factory: function() {
        this.user.sales
          .select(this.COUNT()).then((c) => {
            this.receivablesCount = c.value;
          });
        return 0;
      }
    },
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
              self.pushMenu('sme.main.invoices.payables');
            })
          .end()
        .end()
        .start()
          .show(this.payablesCount$.map((value) => value > 0))
          .addClass('invoice-list-wrapper')
          .select(this.myDAOPayables$proxy, (invoice) => {
            return this.E().start({
              class: 'net.nanopay.sme.ui.InvoiceRowView',
              data: invoice,
              notificationDiv: this

            })
              .on('click', async () => {
                // check if invoice is in sync with accounting software
                let service = null;
                if ( this.XeroInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
                  if ( this.user.integrationCode == this.IntegrationCode.XERO ) {
                    service = this.xeroService;
                  } else {
                    this.add(this.NotificationMessage.create({ message: ' Cannot sync invoice, Not signed into Xero.', type: 'error' }));
                    return;
                  }
                } else if ( this.QuickbooksInvoice.isInstance(invoice) && this.user.id == invoice.createdBy &&(invoice.status == this.InvoiceStatus.UNPAID || invoice.status == this.InvoiceStatus.OVERDUE) ) {
                  if ( this.user.integrationCode == this.IntegrationCode.QUICKBOOKS ) {
                  service = this.quickbooksService;
                  } else {
                    this.add(this.NotificationMessage.create({ message: ' Cannot sync invoice, Not signed into Quickbooks.', type: 'error' }));
                    return;
                  }
                }
                if ( service != null ) {
                  let result = await service.singleSync(null, invoice);
                  if ( ! result.result ) {
                    if ( result.errorCode === this.AccountingErrorCodes.TOKEN_EXPIRED ) {
                      this.ctrl.add(this.Popup.create({ closeable: false }).tag({
                        class: 'net.nanopay.accounting.AccountingTimeOutModal'
                      }));
                    } else {
                      this.add(this.NotificationMessage.create({
                        message: result.reason,
                        type: 'error'
                     }));
                    }
                    return;
                  }
                }

                this.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: invoice,
                  isPayable: true,
                });
              })
            .end();
          })
        .end()
        .start()
          .hide(this.payablesCount$.map((value) => value > 0))
          .addClass('invoice-empty-state').add('No recent payables to show')
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
              self.pushMenu('sme.main.invoices.receivables');
            })
          .end()
        .end()
        .start()
          .show(this.receivablesCount$.map((value) => value > 0))
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
        .end()
        .start()
          .hide(this.receivablesCount$.map((value) => value > 0))
          .addClass('invoice-empty-state').add('No recent receivables to show')
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
