/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx',
  name: 'ComplianceTransactionApprovalRequestController',
  extends: 'foam.u2.Controller',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'approvalRequestDAO',
    'complianceTransactionApprovalRequestDAO',
    'currencyDAO',
    'notify',
    'subject',
    'transactionDAO'
  ],

  exports: [
    'filteredDAO as complianceTransactionApprovalRequestDAO'
  ],

  css: `
    ^container {
      padding: 32px;
    }

    ^ .foam-u2-view-RichChoiceView-container {
      z-index: 1000;
    }

    ^show-assigned .foam-u2-CheckBox {
      margin-left: 10px;
    }

    ^table-buttons .foam-u2-ActionView {
      margin-left: 10px;
    }

    ^currency {
      margin: 10px 0;
    }

    ^amounts {
      margin: 10px 0;
    }

    ^table-tools {
      margin-top: 10px;
      margin-bottom: 20px;
      align-items: center;
    }

    ^browse-title{
      padding-bottom: 32px;
    }

    ^label{
      padding-bottom: 8px;
    }
  `,

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'net.nanopay.tx.MatchCurrency'
  ],

  messages: [
    {
      name: 'SUCCESS_BATCH_APPROVED',
      message: 'You have successfully approved these requests'
    },
    {
      name: 'REFRESH_MSG',
      message: 'Refresh Requested ... '
    },
    {
      name: 'BATCH_TITLE',
      message: 'Batch Transaction Requests'
    },
    {
      name: 'CURRENCY_TITLE',
      message: 'Batch by currency'
    },
    {
      name: 'REQUESTED_TITLE',
      message: 'Requested'
    },
    {
      name: 'RECEIVED_TITLE',
      message: 'Received'
    },
    {
      name: 'SHOW_ASSIGNED_TITLE',
      message: 'Show Assigned To Me'
    }
  ],

  properties: [
    {
      class: 'Reference',
      name: 'currency',
      of: 'foam.core.Currency',
      value: 'CAD',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Currencies',
              dao: X.currencyDAO
            }
          ]
        };
      }
    },
    {
      name: 'dao',
      factory: function(){
        return this.complianceTransactionApprovalRequestDAO;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      factory: function() { return this.dao; },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'referenceSummary',
          'assignedTo.legalName',
          'createdFor',
          'status',
          'memo'
        ],
        css: {
          width: '100%',
          'min-height': '424px'
        }
      }
    },
    {
      class: 'Long',
      name: 'requested'
    },
    {
      class: 'Long',
      name: 'received'
    },
    {
      class: 'Boolean',
      name: 'showAssigned'
    }
  ],

  methods: [
    {
      name: 'initE',
      code: function() {
        var self = this;

        this.SUPER();
        this.start().addClass(this.myClass())
          .start(this.Rows).addClass(this.myClass('container'))
            .start()
              .addClasses(['h100', this.myClass('browse-title')])
              .add(this.BATCH_TITLE)
            .end()
            .start().addClass(this.myClass('currency'))
              .start()
                .addClasses(['h500', this.myClass('label')])
                .add(this.CURRENCY_TITLE)
              .end()
              .tag(this.CURRENCY)
            .end()
            .start().addClass(this.myClass('amounts'))
              .add(this.slot(function(requested, received, currency, currencyDAO) {
                return currencyDAO.find(currency).then(currency => {
                  return self.E()
                    .start(self.Cols)
                      .start().addClass(self.myClass('requested'))
                        .start()
                          .addClasses(['h500', this.myClass('label')])
                          .add(this.REQUESTED_TITLE)
                        .end()
                        .start()
                          .add(currency.format(requested))
                        .end()
                      .end()
                      .start().addClass(self.myClass('received'))
                        .start()
                          .addClasses(['h500', this.myClass('label')])
                          .add(this.RECEIVED_TITLE)
                        .end()
                        .start()
                          .add(currency.format(received))
                        .end()
                      .end()
                    .end()
                  .start()
                .end();
                });
              }))
            .end()
            .start(this.Cols).addClass(this.myClass('table-tools'))
              .start(this.Cols).style({ 'align-items': 'center' })
                .addClass(this.myClass('show-assigned'))
                .start()
                  .addClass('p')
                  .add(this.SHOW_ASSIGNED_TITLE)
                .end()
                .tag(this.SHOW_ASSIGNED)
              .end()
              .start(this.Cols).addClass(this.myClass('table-buttons'))
                .start()
                  .add(this.REFRESH_TABLE)
                .end()
                .start()
                  .add(this.APPROVE_ALL)
                .end()
              .end()
            .end()
            .start()
              .add(this.FILTERED_DAO)
            .end()
          .end()
        .end();

        this.currency$.sub(this.updateBalances);
        this.showAssigned$.sub(this.updateAssigned);

        this.updateBalances();
      }
    }
  ],

  actions: [
    {
      name: 'refreshTable',
      code: function(X) {
        this.filteredDAO.cmd_(X, foam.dao.CachingDAO.PURGE);
        this.filteredDAO.cmd_(X, foam.dao.AbstractDAO.RESET_CMD);
        this.updateBalances();
        this.notify(this.REFRESH_MSG, '', this.LogLevel.INFO, true);
      }
    },
    {
      name: 'approveAll',
      isAvailable: function(showAssigned) {
        return showAssigned;
      },
      code: function(X) {
        this.filteredDAO.select(request => {
          request.status = foam.nanos.approval.ApprovalStatus.APPROVED;
          return this.approvalRequestDAO.put(request);
        }).then(requests => {
          console.log('requests', requests);
          this.filteredDAO.cmd_(X, foam.dao.CachingDAO.PURGE);
          this.filteredDAO.cmd_(X, foam.dao.AbstractDAO.RESET_CMD);
          this.updateBalances();
          this.finished.pub();
          this.notify(this.SUCCESS_BATCH_APPROVED, '', this.LogLevel.INFO, true);
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ],

  listeners: [
    {
      name: 'updateBalances',
      isFramed: true,
      code: function() {
        if ( ! this.currency ) return;

        this.requested = 0;
        this.received = 0;

        var predicate = this.showAssigned ? this.AND(
          this.MatchCurrency.create({
            currency: this.currency
          }),
          this.EQ(
            net.nanopay.tx.TransactionApprovalRequest.ASSIGNED_TO,
            this.subject.realUser.id
          )
        ) : this.MatchCurrency.create({
          currency: this.currency
        });

        this.filteredDAO = this.dao.where(predicate);
        this.filteredDAO.where(
            this.EQ(
              net.nanopay.tx.TransactionApprovalRequest.STATUS,
              foam.nanos.approval.ApprovalStatus.REQUESTED
            )
          ).select(request => {
            this.transactionDAO.find(request.objId).then(txn => {
              this.requested += txn.destinationAmount;

              if ( request.memo )  this.received += txn.destinationAmount;
            })});
      }
    },
    {
      name: 'updateAssigned',
      isFramed: true,
      code: function() {
        if ( ! this.currency ) return;

        var predicate = this.showAssigned ? this.AND(
          this.MatchCurrency.create({
            currency: this.currency
          }),
          this.EQ(
            net.nanopay.tx.TransactionApprovalRequest.ASSIGNED_TO,
            this.subject.realUser.id
          )
        ) : this.MatchCurrency.create({
          currency: this.currency
        });

        this.filteredDAO = this.dao.where(predicate);

        this.updateBalances();
      }
    }
  ]
});
