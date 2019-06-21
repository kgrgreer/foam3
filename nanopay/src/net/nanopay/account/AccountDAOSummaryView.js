/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  css:`
    ^ {
      padding: 32px
    }

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
          default:
            return '💰';
        }
      }
    },
    {
      class: 'String',
      name: 'denominationSymbol',
      factory: function() {
        /**
         * TODO: we might want to make flags a property of currencies/denominations
         * and use images instead of emojis
         */
        switch(this.data.denomination){
          case 'USD':
            return 'US＄';
          case 'CAD':
            return 'C＄';
          case 'EUR':
            return '€';
          case 'GBP':
            return '£';
          case 'INR':
            return '₹'
          default:
            return '＄';
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
        .add(self.slot(function(data, config, data$id, data$denomination) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                // we will handle this in the StackView instead
                .startContext({ data: self.stack })
                    .tag(self.stack.BACK, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/back-icon.svg',
                      label: `All ${config.of.name}s`
                    })
                .endContext()
                .start(self.Cols).style({ 'align-items': 'center' })
                  .start()
                    .add(data.toSummary())
                      .addClass(this.myClass('account-name'))
                  .end()
                  .startContext({data: data}).add(self.primary).endContext()
                .end()
              .end()

              .start(self.Cols)
                .start(self.Cols).addClass(this.myClass('actions-header'))
                  .startContext({data: self})
                    .tag(self.EDIT, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/edit-icon.svg'
                    })
                    .tag(self.DELETE, {
                      buttonStyle: foam.u2.ButtonStyle.TERTIARY,
                      icon: 'images/delete-icon.svg'
                    })  
                  .endContext()
                .end()
              .end()
              .start(self.CardBorder).addClass(this.myClass('balance-card'))
                .start(self.Rows)
                  .start()
                    .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                  .end()
                  .start().addClass(this.myClass('balance'))
                    .add(data.findBalance(self.__context__)
                          .then(balance => self.__subSubContext__.currencyDAO.find(self.data.denomination)
                            .then(curr => balance != null 
                              ? `${curr.format(balance)}  ${this.denominationFlag}` 
                              : `0 ${this.denominationFlag}`
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
                            ),
                })
                .addClass(this.myClass('transactions-table'))
              .end()
              .end()
              .start(foam.u2.detail.SectionedDetailView, {
                data: data
              })
                .addClass(this.myClass('detail-view'))
              .end()
            .end();
        }));
    }
  ]
});
