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
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesView',
  extends: 'foam.u2.Controller',

  documentation: 'Summary View of Expenses Invoices.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.InvoiceSummaryView',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'user'
  ],

  exports: [
    'hideSummary'
  ],

  properties: [
    'selection',
    {
      name: 'summaryView',
      documentation: `A named reference to the summary view so we can subscribe
          to events emitted from it.`,
    },
    {
      class: 'Boolean',
      name: 'hideSummary',
      value: false
    },
    {
      name: 'expensesDAO',
      factory: function() {
        return this.user.expenses;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(filter) {
        return this.expensesDAO.where(
          this.OR(
            this.CONTAINS_IC(this.Invoice.INVOICE_NUMBER, filter),
            this.CONTAINS_IC(this.Invoice.PURCHASE_ORDER, filter)
          )).orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      },
    },
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Invoice #, PO #',
        onKey: true
      }
    }
  ],

  css: `
    ^{
      width: 970px;
      margin: auto;
    }
    ^ .net-nanopay-invoice-ui-SummaryCard{
      width: 15.8%;
    }
    ^ .optionsDropDown {
      left: -92 !important;
      top: 30 !important;
    }
    ^ .foam-u2-ActionView-create{
      position: relative;
      top: -32;
      margin-right: 5px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .button-div{
      height: 40px;
    }
    ^ .foam-u2-view-TableView td{
      width: 8px;
    }
    ^ .foam-u2-ListCreateController{
      top: 30px;
      position: relative;
    }
     ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      display: inline-block;
      margin-bottom: -40px;
      vertical-align: top;
      border: 0;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^ .hide {
      display:none;
    }
  `,

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an ' +
          'invoice from your partners, it will show up here.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideSummary$)
          .tag(this.InvoiceSummaryView, {
            sumLabel: 'Payables',
            dao: this.user.expenses
          }, this.summaryView$)
        .end()
        .start()
          .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').enableClass('hide', this.hideSummary$).end()
          .start(this.FILTER).addClass('filter-search').enableClass('hide', this.hideSummary$).end()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.filteredDAO$proxy,
            createLabel: 'New Bill',
            createDetailView: {
              class: 'net.nanopay.invoice.ui.InvoiceDetailView',
              isBill: true
            },
            detailView: { class: 'net.nanopay.invoice.ui.ExpensesDetailView' },
            summaryView: this.ExpensesTableView,
            showActions: false
          })
        .end()
        .start()
          .enableClass('hide', this.hideSummary$)
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.expensesDAO,
            message: this.placeholderText,
            image: 'images/ic-bankempty.svg'
          })
        .end();

      // When a SummaryCard is clicked on, it will toggle between two states:
      // active and inactive. When it changes state it will emit one of the two
      // following events. We subscribe to them here and update the table view
      // based on the card that was selected.
      this.summaryView.statusChange.sub(this.updateTableDAO);
      this.summaryView.statusReset.sub(this.resetTableDAO);
    },
  ],

  listeners: [
    {
      name: 'updateTableDAO',
      code: function(_, __, newStatus) {
        this.filteredDAO = this.expensesDAO
            .where(this.EQ(this.Invoice.STATUS, newStatus))
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'resetTableDAO',
      code: function() {
        this.filteredDAO = this.expensesDAO
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.invoice.model.Invoice'
      ],

      imports: [
        'expensesDAO'
      ],

      exports: [
        'selection'
      ],

      properties: [
        'selection',
        {
          name: 'data',
          factory: function() {
            return this.expensesDAO;
          }
        }
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              selection$: this.selection$,
              data$: this.data$,
              config: {
                amount: {
                  tableCellView: function(obj, e) {
                    return e.E()
                        .add('+ $', obj.amount)
                        .style({ color: '#2cab70' });
                  }
                },
                status: {
                  tableCellView: function(obj, e) {
                    var statusCircle = obj.status == self.InvoiceStatus.SCHEDULED
                        ? { border: '3px solid #59a5d5' }
                        : {
                            border: '3px solid #2cab70',
                            background: '#2cab70'
                          };

                    var statusColor = obj.status == self.InvoiceStatus.SCHEDULED
                        ? { color: '#59a5d5' }
                        : { color: '#2cab70' };

                    return e.E()
                        .start('span')
                          .style(statusCircle)
                        .end()
                        .add(obj.status)
                        .style(statusColor);
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'payeeId', 'dueDate',
                'amount', 'status'
              ],
            }).end();
        }
      ]
    }
  ]
});
