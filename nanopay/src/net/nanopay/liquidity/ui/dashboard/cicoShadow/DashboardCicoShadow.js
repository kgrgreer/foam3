foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadow',
  extends: 'foam.u2.Element',
  description: 'Displays a horizontal bar graph for the cash flow of shadow accounts',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.account.ShadowAccount'
  ],

  exports: [
    'shadowAccountDAO',
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
      message: 'DEBITS AND CREDITS',
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'chosenAccount',
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
      name: 'CICOTransactionsDAO',
      documentation: `
      DAO for recent transactions in entire ecosystem
    `,
      expression: function (chosenAccount) {
        return this.transactionDAO.where(
          this.AND(
            //this.GT(this.Transaction.completionDate,start),
            //this.LT(this.Transaction.completionDate,end),
            this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
            this.OR(
              this.AND(
                this.INSTANCE_OF(this.CITransaction),
                this.EQ(this.Transaction.DESTINATION_ACCOUNT, chosenAccount)
              ),
              this.AND(
                this.INSTANCE_OF(this.COTransaction),
                this.EQ(this.Transaction.SOURCE_ACCOUNT, chosenAccount)
              )
            )
          )
        );
      }
    },
    {
      class: 'String',
      name: 'timeFrame',
      value: 'Weekly',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Weekly',
          'Monthly',
          'Quarterly',
          'Annually'
        ]
      },
      postSet: function (_, _) {
        this.rewindFactor = 1;
      }
    },
    {
      class: 'Int',
      name: 'rewindFactor',
      value: 1
    },
    {
      name: 'dateRange',
      expression: function (timeFrame, rewindFactor) {
        var today = new Date();
        switch (timeFrame) {
          case 'Weekly':
            var daysToRewind = 7 * (this.rewindFactor - 1);

            var sun = new Date();
            sun.setHours(0, 0, 0, 0);
            sun.setDate(sun.getDate() - sun.getDay());
            sun.setDate(sun.getDate() - daysToRewind);

            var sat = new Date(sun.getTime());
            sat.setDate(sat.getDate() + 6);
            sat.setHours(23, 59, 59, 999);

            return {
              min: sun,
              max: sat
            };
          case 'Monthly':
            var monthsToRewind = rewindFactor - 1;

            var min = new Date();
            min.setMonth(min.getMonth() - monthsToRewind);
            min.setDate(1);
            min.setHours(0, 0, 0, 0);

            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 1);
            max.setDate(0);
            max.setHours(23, 59, 59, 999);

            return {
              min: min,
              max: max
            };
          case 'Quarterly':
            var monthsToRewind = rewindFactor * 3;

            var currQuarterEndMonth = today.getMonth() + (2 - today.getMonth() % 3) + 1;
            var currQuarterEnd = new Date(today.getFullYear(), currQuarterEndMonth, 0);

            var min = new Date(currQuarterEnd.getTime());
            min.setMonth(min.getMonth() - (monthsToRewind - 1));
            min.setDate(1);
            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 3);
            max.setDate(0);
            max.setHours(23, 59, 59, 999);

            return {
              min: min,
              max: max
            };
          case 'Annually':
            var start = new Date();
            start.setFullYear(start.getFullYear() - this.rewindFactor + 1);
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            var end = new Date(start.getTime());
            end.setMonth(11);
            end.setDate(31);
            end.setHours(23, 59, 59, 999);

            return {
              min: start,
              max: end
            };
        }
      }
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.start()
        .startContext({ data: this })
          .add(this.CHOSEN_ACCOUNT)
        .endContext()
        .start(foam.comics.v2.DAOBrowserView, {
          data: this.CICOTransactionsDAO
        })
          .addClass(this.myClass('accounts-table'))
        .end()
      .end();
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: async function () {
        this.formatYAxis();
        if (!this.chosenAccount) return;
        var txns = this.EasyDAO.create({
          of: 'net.nanopay.tx.model.Transactions',
          daoType: 'ARRAY'
        });
        this.accountCurrency = await this.currencyDAO.find(this.account.denomination);
        var txnSink = await this.data.select();
        var keyMap = {};
        txnSink.array.forEach(b => {
          if (b.completedTime >= this.dateRange.min && b.completedTime <= this.dateRange.max) {
            txns.put(b);
            keyMap[b.key] = 1;
          }
        });
      }
    }
  ],


  actions: [
    {
      name: 'rewind',
      code: function () {
        this.rewindFactor++;
      }
    },
    {
      name: 'forward',
      code: function () {
        if (this.rewindFactor === 1) return;
        this.rewindFactor--;
      }
    }
  ]

});
