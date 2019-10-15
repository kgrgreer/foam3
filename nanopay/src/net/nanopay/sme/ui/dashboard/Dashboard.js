foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.account.Account',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'auth',
    'accountingIntegrationUtil',
    'agent',
    'businessDAO',
    'businessOnboardingDAO',
    'businessInvitationDAO',
    'ctrl',
    'group',
    'invoiceDAO',
    'notificationDAO',
    'pushMenu',
    'stack',
    'quickbooksService',
    'uSBusinessOnboardingDAO',
    'user',
    'userDAO',
    'xeroService',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
  ],

  exports: [
    'myDaoNotification'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'NO_LATEST_ACTIVITY', message: 'No latest activity to display' },
    { name: 'NO_RECENT_PAYABLES', message: 'No recent payables to display' },
    { name: 'NO_RECENT_RECEIVABLES', message: 'No recent receivables to display' },
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
    ^ .empty-state {
      text-align: center;
      padding: 64px 27px;
      border: 1px solid #e2e2e3;
      background: inherit;
      border-radius: 3px;
      font-size: 14px;
      line-height: 25px;
      color: #8e9090;
    }
    ^ .empty-box {
      height: 60px;
      padding:14px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-requestPayment {
      width: 200px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-sendPayment {
      width: 200px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countRequiresApproval',
      factory: function() {
        this.user.expenses
          .where(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_APPROVAL))
          .select(this.COUNT()).then((c) => {
            this.countRequiresApproval = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countOverdueAndUpcoming',
      factory: function() {
        this.user.expenses
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.UNPAID),
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE)
          ))
          .select(this.COUNT()).then((c) => {
            this.countOverdueAndUpcoming = c.value; 
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countDepositPayment',
      factory: function() {
        this.user.sales
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_ACCEPTANCE),
          ))
          .select(this.COUNT()).then((c) => {
            this.countDepositPayment = c.value;
          });
        return 0;
      }
    },
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
          this.AND(
             this.OR(
              this.EQ(this.Notification.USER_ID, this.user.id),
              this.EQ(this.Notification.GROUP_ID, this.group.id),
              this.EQ(this.Notification.BROADCASTED, true)
            ),
            this.NOT(this.IN(
                this.Notification.NOTIFICATION_TYPE,
                this.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.ISSUED_DATE));
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
    {
      class: 'Int',
      name: 'notificationsCount',
      factory: function() {
        this.myDaoNotification$proxy.select(this.COUNT()).then((c) => {
          this.notificationsCount = c.value;
        })
        return 0;
      }
    },
    'bankAccount',
    'userHasPermissionsForAccounting',
    'businessOnboarding',
    'onboardingStatus'
  ],

  methods: [
    async function getUserAccounts() {
      await this.user.accounts
        .where(
          this.AND(
            this.OR(
              this.EQ(this.Account.TYPE, this.BankAccount.name),
              this.EQ(this.Account.TYPE, this.CABankAccount.name),
              this.EQ(this.Account.TYPE, this.USBankAccount.name)
            ),
            this.NEQ(this.BankAccount.STATUS, this.BankAccountStatus.DISABLED)
          )
        ).select()
        .then((sink) => {
          this.bankAccount = sink.array[0];
        });
     this.userHasPermissionsForAccounting = await this.accountingIntegrationUtil.getPermission();

      // We need to find the BusinessOnboarding by checking both the userId and
      // the businessId. Previously we were only checking the userId, which
      // caused a bug when trying to add a user that's already on the platform
      // as a signing officer for another business. The bug was caused by the
      // search by userId finding the BusinessOnboarding for the existing user's
      // other business instead of the one they were recently added to. By
      // including the businessId in our search criteria we avoid this problem.
      this.businessOnboarding = await this.businessOnboardingDAO.find(
        this.AND(
          this.EQ(this.BusinessOnboarding.USER_ID, this.agent.id),
          this.EQ(this.BusinessOnboarding.BUSINESS_ID, this.user.id)
        )
      ) || await this.uSBusinessOnboardingDAO.find(
        this.AND(
          this.EQ(this.USBusinessOnboarding.USER_ID, this.agent.id),
          this.EQ(this.USBusinessOnboarding.BUSINESS_ID, this.user.id)
        )
      );
      this.user = await this.businessDAO.find(this.user.id);
      this.onboardingStatus = this.user.onboarded;
    },

    function initE() {
      this.ctrl.bannerizeCompliance();
      this.SUPER();
      this.getUserAccounts().then(() => {
        var self = this;
        var split = this.DashboardBorder.create();

        var top = this.Element.create()
          .start('h1')
            .add(this.TITLE)
          .end()
          .tag({
            class: 'net.nanopay.sme.ui.dashboard.TopCardsOnDashboard',
            bankAccount: this.bankAccount,
            userHasPermissionsForAccounting: this.userHasPermissionsForAccounting,
            businessOnboarding: this.businessOnboarding,
            onboardingStatus: this.onboardingStatus
          }); // DynamixSixButtons' }); // paths for both dashboards the same, just switch calss name to toggle to old dashboard

        var topL = this.Element.create()
          .start('h2')
            .add(this.SUBTITLE1)
          .end()
          .start()
            .tag(this.RequireActionView.create({
              countRequiresApproval$: this.countRequiresApproval$,
              countOverdueAndUpcoming$: this.countOverdueAndUpcoming$,
              countDepositPayment$: this.countDepositPayment$
            }))
          .end();

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
                  let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
                  if ( updatedInvoice === null || updatedInvoice === undefined ) return;
                  this.stack.push({
                    class: 'net.nanopay.sme.ui.InvoiceOverview',
                    invoice: updatedInvoice,
                    isPayable: true
                  });
                })
              .end();
            })
          .end()
          .start()
            .hide(this.payablesCount$.map((value) => value > 0))
            .addClass('empty-state')
            .start().add(this.SEND_PAYMENT).end()
            .start('p').add(this.NO_RECENT_PAYABLES).end()
          .end();

        var botL = this.Element.create()
          .start('h2')
            .add(this.SUBTITLE3)
          .end()
          .start()
          .show(this.notificationsCount$.map((value) => value > 0))
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
            .end()
            .start()
              .hide(this.notificationsCount$.map((value) => value > 0))
              .addClass('empty-state')
              .start().addClass('empty-box')
                .start('p').add(this.NO_LATEST_ACTIVITY).end()
              .end()
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
            .addClass('empty-state')
            .start().add(this.REQUEST_PAYMENT).end()
            .start('p').add(this.NO_RECENT_RECEIVABLES).end()
          .end();

        split.topButtons.add(top);
        split.leftTopPanel.add(topL);
        split.leftBottomPanel.add(botL);
        split.rightTopPanel.add(topR);
        split.rightBottomPanel.add(botR);

        this.addClass(this.myClass()).add(split).end();
      });
    }
  ],
  actions: [
    {
      name: 'sendPayment',
      label: 'Send payment',
      code: function() {
        this.checkAndNotifyAbilityToPay().then((result) => {
          if ( result ) {
            this.pushMenu('sme.quickAction.send');
          }
        });
      }
    },
    {
      name: 'requestPayment',
      label: 'Request payment',
      code: function() {
        this.checkAndNotifyAbilityToReceive().then((result) => {
          if ( result ) {
            this.pushMenu('sme.quickAction.request');
          }
        });
      }
    }
  ]
});
