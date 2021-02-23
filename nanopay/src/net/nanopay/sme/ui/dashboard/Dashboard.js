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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.crunch.CapabilityStore',
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
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    'net.nanopay.sme.ui.dashboard.DashboardBorder',
    'net.nanopay.sme.ui.dashboard.RequireActionView'
  ],

  imports: [
    'auth',
    'accountingIntegrationUtil',
    'subject',
    'businessDAO',
    'businessOnboardingDAO',
    'businessInvitationDAO',
    'ctrl',
    'group',
    'invoiceDAO',
    'isIframe',
    'notificationDAO',
    'onboardingUtil',
    'pushMenu',
    'stack',
    'quickbooksService',
    'uSBusinessOnboardingDAO',
    'userDAO',
    'xeroService',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'theme'
  ],

  exports: [
    'myDaoNotification'
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
    { name: 'VIEW_ALL', message: 'View all' },
    { name: 'YOUR_LATEST', message: 'Your latest ' },
    { name: 'ITEMS', message: ' items' }
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
    ^ .foam-u2-ActionView-requestPayment {
      width: 200px;
    }
    ^ .foam-u2-ActionView-sendPayment {
      width: 200px;
    }
    ^ .divider-half {
      font-size: 14px;
      background-color: /*%GREY5%*/ #f5f7fa;
      padding: 0 10px;
      text-align: center;
      color: #8e9090;
    }
    ^ .line {
      width: 94%;
      height: 10px;
      border-bottom: 2px solid #e2e2e3;
      text-align: center;
      margin: auto;
      margin-top: 15px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countRequiresApproval',
      factory: function() {
        this.subject.user.expenses
          .where(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_APPROVAL))
          .select(this.COUNT()).then(c => {
            this.countRequiresApproval = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countOverdueAndUpcoming',
      factory: function() {
        this.subject.user.expenses
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.UNPAID),
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE)
          ))
          .select(this.COUNT()).then(c => {
            this.countOverdueAndUpcoming = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countDepositPayment',
      factory: function() {
        this.subject.user.sales
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_ACCEPTANCE),
          ))
          .select(this.COUNT()).then(c => {
            this.countDepositPayment = c.value;
          });
        return 0;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOReceivables',
      factory: function() {
        return this.subject.user.sales
          .orderBy(this.DESC(this.Invoice.LAST_MODIFIED))
          .limit(5);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'myDAOPayables',
      factory: function() {
        return this.subject.user.expenses
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
              this.EQ(this.Notification.USER_ID, this.subject.user.id),
              this.EQ(this.Notification.GROUP_ID, this.group.id),
              this.EQ(this.Notification.BROADCASTED, true)
            ),
            this.EQ( this.Notification.NOTIFICATION_TYPE, 'Latest_Activity'),
            this.NOT(this.IN(
                this.Notification.NOTIFICATION_TYPE,
                this.subject.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.CREATED));
      }
    },
    {
      class: 'Int',
      name: 'payablesCount',
      factory: function() {
        this.subject.user.expenses
          .select(this.COUNT()).then(c => {
            this.payablesCount = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'receivablesCount',
      factory: function() {
        this.subject.user.sales
          .select(this.COUNT()).then(c => {
            this.receivablesCount = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'notificationsCount',
      factory: function() {
        this.myDaoNotification$proxy.select(this.COUNT()).then(c => {
          this.notificationsCount = c.value;
        });
        return 0;
      }
    },
    {
      class: 'String',
      name: 'appName',
      factory: function() {
        return this.theme.appName;
      }
    },
    'bankAccount',
    'userHasPermissionsForAccounting',
    'businessOnboarding',
    'onboardingStatus',
    'businessRegistrationDate',
    'countryOfBusinessRegistration',
    'showLowerCards',
    {
      class: 'Boolean',
      name: 'requestMoneyPermission',
      value: false
    }
  ],

  methods: [
    async function getUserAccounts() {
      await this.subject.user.accounts
        .where(
          this.AND(
            this.OR(
              this.INSTANCE_OF(this.CABankAccount),
              this.INSTANCE_OF(this.USBankAccount)
            ),
            this.NEQ(this.BankAccount.STATUS, this.BankAccountStatus.DISABLED)
          )
        ).select()
        .then(sink => {
          this.bankAccount = sink.array[0];
        });
      this.requestMoneyPermission = await this.auth.check(null, 'menu.read.mainmenu.invoices.receivables');
      this.showLowerCards = await this.auth.check(null, 'dashboard.read.accountingintegrationcards');
      this.userHasPermissionsForAccounting = this.showLowerCards ? 
        await this.accountingIntegrationUtil.getPermission() : 
        null;

      // We need to find the BusinessOnboarding by checking both the userId and
      // the businessId. Previously we were only checking the userId, which
      // caused a bug when trying to add a user that's already on the platform
      // as a signing officer for another business. The bug was caused by the
      // search by userId finding the BusinessOnboarding for the existing user's
      // other business instead of the one they were recently added to. By
      // including the businessId in our search criteria we avoid this problem.
      this.businessOnboarding = await this.businessOnboardingDAO.find(
        this.AND(
          this.EQ(this.BusinessOnboarding.USER_ID, this.subject.realUser.id),
          this.EQ(this.BusinessOnboarding.BUSINESS_ID, this.subject.user.id)
        )
      ) || await this.uSBusinessOnboardingDAO.find(
        this.AND(
          this.EQ(this.USBusinessOnboarding.USER_ID, this.subject.realUser.id),
          this.EQ(this.USBusinessOnboarding.BUSINESS_ID, this.subject.user.id)
        )
      );
    },
    function initE() {
      this.ctrl.bannerizeCompliance();
      this.SUPER();

      var split = this.DashboardBorder.create();
      var capStore = this.CapabilityStore.create(this.ctrl.__subContext__);

      this.getUserAccounts().then(() => {
        var self = this;
        var top = this.Element.create()
          .start('h1')
            .add(this.TITLE)
          .end()
          .add(capStore.renderFeatured())
          .callIf(this.showLowerCards, function() {
            this.start()
              .tag({
                class: 'net.nanopay.sme.ui.dashboard.LowerCardsView',
                bankAccount: this.bankAccount,
                userHasPermissionsForAccounting: this.userHasPermissionsForAccounting
              })
              .end();
          });

        var line = this.Element.create()
          .start().addClass('line')
            .start('span')
              .addClass('divider-half').add(this.YOUR_LATEST + this.appName + this.ITEMS)
            .end()
          .end();

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
              .hide(this.payablesCount$.map(value => value == 0))
              .on('click', function() {
                self.pushMenu('mainmenu.invoices.payables');
              })
            .end()
          .end()
          .start()
            .show(this.payablesCount$.map(value => value > 0))
            .addClass('invoice-list-wrapper')
            .select(this.myDAOPayables$proxy, invoice => {
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
            .hide(this.payablesCount$.map(value => value > 0))
            .addClass('empty-state')
            .start().add(this.SEND_PAYMENT).end()
            .start('p').add(this.NO_RECENT_PAYABLES).end()
          .end();

        var botL = this.Element.create()
          .start('h2')
            .add(this.SUBTITLE3)
          .end()
          .start()
          .show(this.notificationsCount$.map(value => value > 0))
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
              .hide(this.notificationsCount$.map(value => value > 0))
              .addClass('empty-state')
              .start().addClass('empty-box')
                .start('p').add(this.NO_LATEST_ACTIVITY).end()
              .end()
          .end();

        var botR = ! this.requestMoneyPermission ? null : this.Element.create()
          .start()
            .addClass(this.myClass('separate'))
            .start('h2')
              .add(this.SUBTITLE4)
            .end()
            .start('span')
              .addClass(this.myClass('clickable'))
              .add(this.VIEW_ALL)
              .hide(this.receivablesCount$.map(value => value == 0))
              .on('click', function() {
                self.pushMenu('mainmenu.invoices.receivables');
              })
            .end()
          .end()
          .start()
            .show(this.receivablesCount$.map(value => value > 0))
            .addClass('invoice-list-wrapper')
            .select(this.myDAOReceivables$proxy, invoice => {
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
            .hide(this.receivablesCount$.map(value => value > 0))
            .addClass('empty-state')
            .start().add(this.REQUEST_PAYMENT).end()
            .start('p').add(this.NO_RECENT_RECEIVABLES).end()
          .end();

        split.topButtons.add(top);

        split.line.add(line)
          .addClass('latest-ablii-items')
          .hide(this.isIframe());

        split.leftTopPanel.add(topL)
          .addClass('latest-ablii-items')
          .hide(this.isIframe());

        split.leftBottomPanel.add(botL)
          .addClass('latest-ablii-items')
          .hide(this.isIframe());

        split.rightTopPanel.add(topR)
          .addClass('latest-ablii-items')
          .hide(this.isIframe());

        split.rightBottomPanel.add(botR)
          .addClass('latest-ablii-items')
          .hide(this.isIframe());

        this.addClass(this.myClass()).add(split);
      });
    }
  ],
  actions: [
    {
      name: 'sendPayment',
      label: 'Send payment',
      code: function() {
        this.checkAndNotifyAbilityToPay().then(result => {
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
        this.checkAndNotifyAbilityToReceive().then(result => {
          if ( result ) {
            this.pushMenu('sme.quickAction.request');
          }
        });
      }
    }
  ]
});
