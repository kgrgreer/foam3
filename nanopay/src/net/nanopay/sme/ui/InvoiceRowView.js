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
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceRowView',
  extends: 'foam.u2.View',

  documentation: `
    A single row in a list of invoices.

    USAGE:

      properties: [
        ...
        {
          class: 'foam.dao.DAOProperty',
          name: 'myDAO'
        }
        ...
      ]

      initE() {
        ...
        .select(this.myDAO$proxy, function(invoice) {
          return this.E().start({
            class: 'net.nanopay.sme.ui.InvoiceRowView',
            data: invoice
          })
            .on('click', function() {
              // Do something with the invoice if you want.
            })
          .end();
        })
        ...
      }
  `,

  imports: [
    'canReceiveCurrencyDAO',
    'ctrl',
    'currencyDAO',
    'notificationDAO',
    'notify',
    'stack',
    'subject',
    'xeroService',
    'quickbooksService',
    'accountingIntegrationUtil',
    'userDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.notification.Notification',
    'net.nanopay.accounting.AccountingErrorCodes',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  css: `
    ^ {
      cursor: pointer;
      box-shadow: 0 1px 1px 0 #dae1e9;
      background: white;
      border-bottom: 1px solid #e2e2e3;
      padding: 12px 24px;
    }

    ^row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px;
      min-height: 27px;
    }

    ^ .quick-action-button {
      cursor: pointer;
      font-size: 10px;
      color: #604aff;
      background: white;
      border: 1px solid #604aff;
      border-radius: 4px;
      min-width: 70px;
      min-height: 24px;
    }

    ^ .quick-action-button:hover {
        color: white;
        background: #604aff;;
      }

    ^ .quick-action-button:focus {
      outline: none;
    }

    ^.min-height-row {
      min-height: 27px;
    }
  `,

  properties: [
    {
      name: 'INVOICE_STATUS_FOR_QUICK_ACTION',
      factory: function() {
        return [this.InvoiceStatus.UNPAID, this.InvoiceStatus.OVERDUE];
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'data',
      documentation: 'Set this to the invoice you want to display in this row.'
    },
    {
      class: 'String',
      name: 'currencyFormatted',
      value: '...',
      documentation: `Used internally to show the formatted currency value.`
    },
    {
      name: 'isMouseover',
      class: 'Boolean',
      value: false
    },
    {
      name: 'isPayable',
      expression: function(data, subject) {
        return data.payerId === subject.user.id;
      }
    },
    {
      name: 'showQuickAction',
      expression: function(isMouseover, data, INVOICE_STATUS_FOR_QUICK_ACTION, isPayable) {
        return isMouseover && isPayable && INVOICE_STATUS_FOR_QUICK_ACTION
          .indexOf(data.status) != -1;
      },
      documentation: `Determine when to show the QuickAction in the payables/receivables lists.
                      Hide the reminder button temporarily. To enable the reminder button for
                      receivables, please remove the 'isPayable' condition in the expression.`
    },
  ],

  messages: [
    { name: 'REMINDER_SENT_SUCCESSFULLY', message: 'Reminder was successfully sent to ${0}.' },
    { name: 'REMINDER_ERROR_MESSAGE', message: 'An error occurred while sending a reminder to ${0}' }
  ],

  methods: [
    function initE() {
      var label = this.data.payeeId === this.subject.user.id ?
        this.data.payer.toSummary() :
        this.data.payee.toSummary();
      var dueDateFormatted = this.data.dueDate ?
        'Due ' + this.data.dueDate.toLocaleDateString(foam.locale) :
        '';
      this.currencyDAO.find(this.data.destinationCurrency)
        .then((currency) => {
        this.currencyFormatted = currency.format(this.data.amount);
     });

      this
        .addClass(this.myClass())
          .on('mouseover', () => this.isMouseover = true)
          .on('mouseout', () => this.isMouseover = false)
          .start()
            .addClass(this.myClass('row'))
            .start('span').add(label).end()
            .start('span')
              .call(
                this.data.STATUS.tableCellFormatter.f,
                [this.data.status, this.data]
              )
            .end()
          .end()
          .start()
            .addClass(this.myClass('row')).addClass('min-height-row')
            .start('span').add(this.currencyFormatted$).end()
            .start()
              .start().show(this.showQuickAction$)
                .start('button').addClass('quick-action-button')
                  .add(this.isPayable ? 'Pay Now' : 'Remind')
                  .on('click', (e) => this.isPayable ? this.payNow(e) : this.remind(e))
                .end()
              .end()
              .start().hide(this.showQuickAction$).add(dueDateFormatted).end()
            .end()
        .end();
    },

    async function payNow(event) {
      event.preventDefault();
      event.stopPropagation();
      var request = this.CanReceiveCurrency.create({
        userId: this.data.payeeId,
        currencyId: this.data.destinationCurrency
      });
      let responseObj = await this.canReceiveCurrencyDAO.put(request);
      if ( ! responseObj.response ) {
        this.ctrl.notify(responseObj.message, '', this.LogLevel.ERROR, true);
        return;
      }
      let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(this.data);
      if ( updatedInvoice === null || updatedInvoice === undefined ) return;
      this.stack.push({
        class: 'net.nanopay.sme.ui.SendRequestMoney',
        isPayable: this.isPayable,
        isForm: false,
        isDetailView: true,
        invoice: updatedInvoice
      });
    },

    async function remind(event) {
      event.preventDefault();
      event.stopPropagation();

      var notification = this.Notification.create();
      // TODO: set email template when ready using 'emailName'
      notification.userId = this.data.payerId;

      try {
        await this.notificationDAO.put(notification);
        var successMessage = this.REMINDER_SENT_SUCCESSFULLY.replace('${0}', this.data.payer.businessName || this.data.payer.toSummary());
        this.notify(successMessage, '', this.LogLevel.INFO, true);
      } catch (exception) {
        var errorMessage = this.REMINDER_ERROR_MESSAGE.replace('${0}', this.data.payer.businessName || this.data.payer.toSummary());
        this.notify(errorMessage, '', this.LogLevel.ERROR, true);
        console.error(exception);
      }
    }
   ]
});
