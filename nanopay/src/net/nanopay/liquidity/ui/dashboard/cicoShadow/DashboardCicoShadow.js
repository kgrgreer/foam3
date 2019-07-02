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
      class: 'Date',
      name: 'timeFrame',
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
      class: 'String',
      name: 'timeFrequency',
      value: 'Weekly',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Weekly',
          'Monthly',
          'Quarterly',
          'Annually'
        ]
      }
    },
    {
      name: 'dateRange',
      expression: function ( timeFrequency, yItemsLimit, timeFrame ) {
        // TODO: Include timeFrame
        var max = new Date();
        var min = new Date();

        switch (timeFrequency) {
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
              .add(this.TIME_FREQUENCY)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start().style({ 'width': '930px', 'height': '266px' }).addClass(this.myClass('chart'))
          .add(this.HorizontalBarDAOChartView.create({
            account$: this.account$,
            timeFrequency$: this.timeFrequency$,
            timeFrame$: this.dateRange$,
            data: this.cicoTransactionsDAO,
            width: 920,
            height: 240
          }))
        .end()
    }
  ]
});
