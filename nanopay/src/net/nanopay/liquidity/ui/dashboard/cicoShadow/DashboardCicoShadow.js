foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadow',
  extends: 'foam.u2.Element',
  description: 'Displays a horizontal bar graph for the cash flow of shadow accounts',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
  ^ {
    padding: 32px 16px;
  }

  ^ .property-account {
    display: inline-block;
  }

  ^ .property-timeFrame {
    display: inline-block;
  }

  ^card-header-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  ^ .foam-u2-tag-Select {
    margin-left: 16px;
  }

  ^chart {
    margin-top: 32px;
  }
`,

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.analytics.Candlestick',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'org.chartjs.HorizontalBarDAOChartView',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.u2.detail.SectionedDetailPropertyView',
  ],

  exports: [
    'shadowAccountDAO'
  ],
  imports: [
    'accountDAO',
    'transactionDAO'
  ],

  messages: [
    {
      name: 'TIMEFRAME_WEEKLY',
      message: 'Weekly'
    },
    {
      name: 'TIMEFRAME_MONTHLY',
      message: 'Monthly'
    },
    {
      name: 'TIMEFRAME_QUARTERLY',
      message: 'Quarterly'
    },
    {
      name: 'TIMEFRAME_ANNUALLY',
      message: 'Annually'
    },
    {
      name: 'LABEL_MILLIONS',
      message: 'Millions'
    },
    {
      name: 'CARD_HEADER',
      message: 'CASH IN / OUT OF SHADOW ACCOUNTS',
    }
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate',
      factory: function() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return oneWeekAgo;
      }
    },
    {
      class: 'Date',
      name: 'endDate',
      factory: function() {
        return new Date();
      }
    },
    {
      class: 'Int',
      name: 'yItemsLimit',
      value: 3
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      targetDAOKey: 'shadowAccountDAO',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'shadowAccountDAO',
      documentation: `
        A predicatedAccountDAO which only pulls shadow accounts
      `,
      expression: function () {
        return this.accountDAO.where(this.INSTANCE_OF(this.ShadowAccount));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'cicoTransactionsDAO',
      documentation: `
      DAO for recent transactions in entire ecosystem
    `,
      expression: function (account) {
        return this.transactionDAO.where(
          this.AND(
            this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
            this.OR(
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.CITransaction),
                this.EQ(this.Transaction.DESTINATION_ACCOUNT, account)
              ),
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.COTransaction),
                this.EQ(this.Transaction.SOURCE_ACCOUNT, account)
              )
            )
          )
        );
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'dateFrequency',
      value: 'WEEKLY'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.Cols)
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .startContext({ data: this })
            .start(this.Cols).addClass(this.myClass('buttons'))
                .start().add(this.ACCOUNT).end()
                .start().add(this.DATE_FREQUENCY).end()
            .end()
          .endContext()
        .end()
        .start().style({ 'width': '1325px', 'height': '320px' }).addClass(this.myClass('chart'))
          .add(this.HorizontalBarDAOChartView.create({
            account$: this.account$,
            dateFrequency$: this.dateFrequency$,
            startDate$: this.startDate$,
            endDate$: this.endDate$,
            data$: this.cicoTransactionsDAO$,
            labelExpr: net.nanopay.tx.model.Transaction.TYPE,
            xExpr: net.nanopay.tx.model.Transaction.AMOUNT,
            yExpr: net.nanopay.tx.model.Transaction.COMPLETION_DATE,
            width: 1325,
            height: 300
          }))
        .end()
        .startContext({ data: this })
          .start(this.Cols).addClass(this.myClass('buttons'))
              .tag(this.SectionedDetailPropertyView, {
                data: this,
                prop: this.START_DATE
              })
              .tag(this.SectionedDetailPropertyView, {
                data: this,
                prop: this.END_DATE
              })
          .end()
        .endContext()
    }
  ]
});
