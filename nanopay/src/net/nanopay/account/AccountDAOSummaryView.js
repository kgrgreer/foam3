/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  requires: [
    'net.nanopay.account.AccountDAOSummaryViewView'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      factory: function() {
        const { data } = this;
        return this.AccountDAOSummaryViewView.create({ data });
      }
    }
  ],
});

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOSummaryViewView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  css:`
    ^balance-card {
      width: 448px;
      height: 188px;
      margin: 32px 0px;
      padding: 24px 16px;
    }

    ^balance {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.43;
    }

    ^balance-note {
      font-size: 12px;
      color: #5e6061;
      line-height: 1.5;
      font-style: italic;
    }

    ^denom-flag {
      margin-left: 8px;
    }

    ^card-header {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 52px;
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }

    ^actions-header .foam-u2-ActionView {
      margin-right: 24px;
      line-height: 1.5
    }

    ^view-container {
      margin: auto;
    }

    ^table-header {
      padding: 32px 0px 12px 16px;
      font-weight: 600;
      font-size: 12px;
    }

    ^transactions-table {
      margin: 32px 8px;
    }

    ^card-row {
      margin-top: 32px;
    }
  `,

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'net.nanopay.account.AccountBalanceView',
    'foam.u2.detail.GridSectionView',
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Card',
    'foam.u2.layout.Grid'
  ],
  imports: [
    'transactionDAO'
  ],

  messages: [
    {
      name: 'TABLE_HEADER',
      message: 'TRANSACTIONS'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, data$id) {
          return self.E()
            .start(self.Rows)
              .start(self.Grid).addClass(this.myClass('card-row'))
                .start(self.Card, { columns: 4 })
                  .tag(self.AccountBalanceView, { data })
                .end()
                .start(this.Card, { columns: 4 })
                  .tag(self.GridSectionView, { 
                    data,
                    section: {
                      properties: [
                        'created',
                        'createdBy',
                        'type',
                        'id',

                      ]
                    }
                  })
                .end()
                .start(this.Card, { columns: 4 })
                  .tag(self.GridSectionView, { 
                    data 
                  })
                .end()
              .end()
              .start(self.CardBorder).addClass(this.myClass('transactions-table'))
                .start().add(self.TABLE_HEADER).addClass(this.myClass('table-header')).end()
                .start(foam.comics.v2.DAOBrowserView, {
                  data: self.transactionDAO
                          .where
                            (self.OR(self.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, data$id)),
                                    (self.EQ(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, data$id))  
                            )
                          .orderBy(this.DESC(net.nanopay.tx.model.Transaction.CREATED))
                          .limit(20),
                })
                .end()
              .end()
            .end();
        }));
    }
  ]
});
