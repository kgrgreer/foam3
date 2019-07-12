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
  `,

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder'
  ],
  imports: [
    'transactionDAO'
  ],
  properties: [
    {
      class: 'String',
      name: 'denominationFlag',
      factory: function() {
        /**
         * TODO: we might want to make flags a property of currencies/denominations
         * and use images instead of emojis
         */
        switch(this.data.denomination){
          case 'USD':
            return '🇺🇸';
          case 'CAD':
            return '🇨🇦';
          case 'INR':
            return '🇮🇳';
          default:
            return '💰';
        }
      }
    }
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'BALANCE',
    },
    {
      name: 'BALANCE_NOTE',
      message: 'Total value shown in home currency',
    },
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
        .add(self.slot(function(data, data$id, data$denomination, denominationFlag) {
          return self.E()
            .start(self.Rows)
              .start(self.CardBorder).addClass(this.myClass('balance-card'))
                .start(self.Rows)
                  .start()
                    .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                  .end()
                  .start().addClass(this.myClass('balance'))
                    .add(data.findBalance(self.__context__)
                          .then(balance => self.__subSubContext__.currencyDAO.find(data$denomination)
                            .then(curr => balance != null 
                              ? `${curr.format(balance)}  ${denominationFlag}` 
                              : `0 ${denominationFlag}`
                            )
                          )
                        )
                  .end()
                  .start().addClass(this.myClass('balance-note'))
                    .add(self.BALANCE_NOTE)
                    .add(` (${data$denomination})`)
                  .end()
                .end()
              .end()
              .start(self.CardBorder)
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
                .addClass(this.myClass('transactions-table'))
              .end()
              .end()
              .start(foam.u2.detail.SectionedDetailView, {
                data
              })
                .addClass(this.myClass('detail-view'))
              .end()
            .end();
        }));
    }
  ]
});
