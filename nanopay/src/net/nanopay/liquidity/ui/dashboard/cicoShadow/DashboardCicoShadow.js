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

  ^shifter {
    margin: 36px 0;
    padding: 0px 16px;
  }

  ^ .foam-u2-ActionView img {
    margin-right: 0;
  }

  ^ .foam-u2-ActionView-secondary:disabled {
    opacity: 0.4;
  }
`,

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.analytics.Candlestick',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'org.chartjs.HorizontalBarDAOChartView',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols'
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
      class: 'DateTime',
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
        // return this.accountDAO.where(this.INSTANCE_OF(this.ShadowAccount));
        return this.accountDAO.where(this.TRUE);
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
          this.TRUE
          // this.AND(
          //   //this.GT(this.Transaction.completionDate,start),
          //   //this.LT(this.Transaction.completionDate,end),
          //   this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
          //   this.OR(
          //     this.AND(
          //       this.INSTANCE_OF(this.CITransaction),
          //       this.EQ(this.Transaction.DESTINATION_ACCOUNT, account)
          //     ),
          //     this.AND(
          //       this.INSTANCE_OF(this.COTransaction),
          //       this.EQ(this.Transaction.SOURCE_ACCOUNT, account)
          //     )
          //   )
          // )
        );
      }
    },
    // groupBy gLang, SUM
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'dateFrequency'
    },
    {
      name: 'dateRange',
      expression: function ( dateFrequency, yItemsLimit, endDate ) {
        // TODO: Include endDate
        var max = endDate;
        var min = new Date();

        switch (dateFrequency) {
          case 'Weekly':            
            var daysFromSun = max.getDay();
            var daysToRewind = 7 * (yItemsLimit - 1) + daysFromSun;
            min.setDate(max.getDate() - daysToRewind);
            break;

          case 'Monthly':            
            min.setDate(1);
            min.setMonth(max.getMonth() - (yItemsLimit - 1))
            break;

          case 'Quarterly':
            var monthsFromQStart = max.getMonth() % 3;
            var monthsToRewind = 3 * (yItemsLimit - 1) + monthsFromQStart;
            min.setDate(max.getMonth() - monthsToRewind);
            break;

          case 'Annually':
            min.setDate(1);
            min.setFullYear(max.getFullYear() - (yItemsLimit - 1));
            break;
        }
        
        return {
          min,
          max
        };
      }
    },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.Cols).style({ 'align-items': 'center' })
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .start(this.Cols)
            .startContext({ data: this })
              .add(this.ACCOUNT)
              .add(this.DATE_FREQUENCY)
              .add(this.END_DATE)
            .endContext()
          .end()
        .end()
        .start().style({ 'width': '930px', 'height': '266px' }).addClass(this.myClass('chart'))
          .add(this.HorizontalBarDAOChartView.create({
            account$: this.account$,
            timeFrequency$: this.dateFrequency$,
            dateRange$: this.dateRange$,
            data: this.cicoTransactionsDAO,
            width: 920,
            height: 240
          }))
        .end()
    }
  ]
});
