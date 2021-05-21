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
  package: 'net.nanopay.liquidity.ui.transaction',
  name: 'TransactionDAOBrowserView',
  extends: 'foam.comics.v2.DAOBrowserView',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'notify'
  ],

  exports: [
    'searchColumns'
  ],

  css: `
    ^container-selection {
      display: flex;
      flex-direction: row;

      width: 100%;

      box-sizing: border-box;
      border-bottom: solid 1px #e7eaec;
    }

    ^title {
      margin: 0;
      flex: 1 1 0;
      padding: 16px;

      text-align: center;
      align-self: center;
      border-right: solid 1px #e7eaec;
    }

    ^ .property-accountSelection {
      flex: 3 1 0;
    }

    ^ .foam-u2-view-RichChoiceView {
      width: 100%;
      z-index: 2;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view {
      border: none;
      height: 100%;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view:hover {
      cursor: pointer;
    }

    ^ .foam-u2-view-RichChoiceView .search {
      padding: 8px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f4f4f9;
    }

    ^ .foam-u2-view-RichChoiceView-heading {
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    ^ .DefaultRowView-row {
      padding: 8px 16px;
      color: #424242;
    }
  `,

  messages: [
    {
      name: 'LABEL_ACCOUNT_TITLE',
      message: 'Select an account to see associated transactions'
    },
    {
      name: 'NO_TRANSACTIONS',
      message: 'Selected account has no transactions'
    }
  ],

  properties: [
    {
      name: 'searchColumns',
      value: [
        'type',
        'sourceAccount',
        'destinationAccount',
        'created'
      ]
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, cannedPredicate, searchPredicate, accountSelectionPredicate) {
        return config.dao$proxy.where(this.AND(cannedPredicate, searchPredicate, accountSelectionPredicate));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchFilterDAO',
      expression: function(config, accountSelectionPredicate, cannedPredicate) {
        return config.dao$proxy.where(this.AND(accountSelectionPredicate, cannedPredicate));
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'accountSelectionPredicate',
      expression: function(accountSelection) {
        return ((!! accountSelection) && accountSelection != 0) ?
          this.OR(
            this.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, accountSelection),
            this.EQ(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, accountSelection)) :
          this.TRUE;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'accountSelection',
      view: function(_, X) {
        sec = [
          {
            dao: X.accountDAO.where(X.data.AND( // TODO confirm these filters.***
                X.data.EQ(net.nanopay.account.Account.DELETED, false),
                X.data.EQ(net.nanopay.account.Account.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE)
              )).orderBy(net.nanopay.account.Account.NAME),
            objToChoice: function(a) {
              return [a.id, a.summary];
            }
          }
        ];
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: sec
        };
      },
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.accountSelection$.sub(this.fetchTransactionCount);
      this.addClass(this.myClass());
      this
        .add(this.slot(function(data, config$cannedQueries, searchFilterDAO, accountSelection) {
          return self.E()
            .startContext({ data: self }).addClass(self.myClass('container-selection'))
              .start('p').addClass(self.myClass('title')).add(self.LABEL_ACCOUNT_TITLE).end()
              .start(self.ACCOUNT_SELECTION).end()
            .endContext();
        }));
        this.SUPER();
    },
  ],

  listeners: [
    function fetchTransactionCount() {
      this.predicatedDAO.select(this.COUNT()).then((count) => {
        if ( count.value === 0 ) {
          this.notify(this.NO_TRANSACTIONS, '', this.LogLevel.WARN, true);
        }
      });
    }
  ]
});
