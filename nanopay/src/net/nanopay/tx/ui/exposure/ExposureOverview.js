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
  package: 'net.nanopay.tx.ui.exposure',
  name: 'ExposureOverview',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.ui.exposure.ValueCard'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'debtAccountDAO',
    'userDAO',
    'balanceDAO'
  ],

  css: `
    ^ {
      width: 1024px;
      margin: 0 auto;
    }

    ^title {
      margin-top: 16px;
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
      color: #1e1f21;
    }

    ^section-card {
      background: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
    }

    ^section {
      margin: 32px 16px;

      font-size: 12px;
      font-weight: 600;
      color: #1e1f21;
    }

    ^info-container {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    ^ .foam-u2-view-ScrollTableView-table {
      width: 100%;
    }

    ^ thead > tr > th {
      background-color: white;
    }

    ^ .foam-u2-view-ScrollTableView-scrollbarContainer {
      height: auto !important;
      max-height: 500px;
    }
  `,

  messages: [
    {
      name: 'EXPOSURE_CURRENT',
      message: 'CURRENT EXPOSURE'
    },
    {
      name: 'EXPOSURE_MAX',
      message: 'MAXIMUM EXPOSURE'
    },
    {
      name: 'EXPOSURE_UTILIZATION',
      message: 'EXPOSURE UTILIZATION'
    },
    {
      name: 'EXPOSURE_ALLOCATED',
      message: 'LIQUIDITY ALLOCATED'
    },
    {
      name: 'EXPOSURE_UNALLOCATED',
      message: 'LIQUIDITY UNALLOCATED'
    },
    {
      name: 'EXPOSURE_ALLOCATION_UTILIZATION',
      message: 'LIQUIDITY UTILIZATION'
    },
    {
      name: 'RELATED_ACCOUNTS',
      message: 'RELATED ACCOUNTS'
    },
    {
      name: 'CALCULATING',
      message: 'Calculating...'
    }
  ],

  properties: [
    {
      name: 'debtAccounts'
    },
    {
      name: 'predicatedDebtAccountDAO',
      factory: function() {
        return this.debtAccountDAO.where(this.EQ(this.DebtAccount.CREDITOR_ACCOUNT, this.data.id));
      }
    },
    {
      name: 'accountCurrency'
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    },
    {
      class: 'UnitValue',
      name: 'currentExposure'
    },
    {
      class: 'String',
      name: 'currentExposureFormatted',
      expression: function(accountCurrency, currentExposure, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        if ( ! accountCurrency ) return `${this.data.denomination} ${currentExposure}`;
        return accountCurrency.format(currentExposure);
      }
    },
    {
      class: 'UnitValue',
      name: 'maxExposure',
    },
    {
      class: 'String',
      name: 'maxExposureFormatted',
      expression: function(accountCurrency, maxExposure, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        if ( ! accountCurrency ) return `${this.data.denomination} ${maxExposure}`;
        return accountCurrency.format(maxExposure);
      }
    },
    {
      class: 'String',
      name: 'utilization',
      expression: function(currentExposure, maxExposure, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        if ( maxExposure === 0 ) return '0%';
        return `${((currentExposure / maxExposure) * 100).toFixed(2)}%`;
      }
    },
    {
      class: 'UnitValue',
      name: 'allocatedExposure',
      expression: function(debtAccounts) {
        if ( ! debtAccounts ) return 0;
        var allocated = 0;
        debtAccounts.forEach(function(account) {
          allocated += account.limit;
        });
        return allocated;
      }
    },
    {
      class: 'String',
      name: 'allocatedExposureFormatted',
      expression: function(allocatedExposure, accountCurrency, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        if ( accountCurrency ) return accountCurrency.format(allocatedExposure);
        return allocatedExposure;
      }
    },
    {
      class: 'String',
      name: 'unallocatedExposureFormatted',
      expression: function(allocatedExposure, maxExposure, accountCurrency, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        var unallocatedExposure = maxExposure - allocatedExposure;
        if ( accountCurrency ) return accountCurrency.format(unallocatedExposure);
        return unallocatedExposure;
      }
    },
    {
      class: 'String',
      name: 'allocationUtilization',
      expression: function(allocatedExposure, maxExposure, isLoading) {
        if ( isLoading ) return this.CALCULATING;
        // Went beyond utilization. So % can't be zero unless allocated is also zero
        if ( maxExposure === 0 && allocatedExposure > 0 ) return `${(((allocatedExposure * 2) / allocatedExposure) * 100).toFixed(2)}%`;
        if ( maxExposure === 0 ) return '0%';
        return `${((allocatedExposure / maxExposure) * 100).toFixed(2)}%`;
      }
    }
  ],

  methods: [
    async function init() {
      var self = this;
      this.currencyDAO.find(this.data.denomination).then(function(currency) {
        self.accountCurrency = currency;
      });
      var sink = await this.predicatedDebtAccountDAO.select();
      if (sink != null) {
        this.debtAccounts = sink.array;
      }
      this.isLoading = false;

      if ( ! this.debtAccounts ) return 0;
      var balanceAccount;
      var currency;
      this.debtAccounts.forEach(async function(account) {
        balanceAccount = await self.balanceDAO.find(account.id);
        currency = await self.currencyDAO.find(account.denomination);
        balanceAccount = balanceAccount != null ?  balanceAccount.balance : 0;
        self.currentExposure += Math.abs(balanceAccount);
      });
      var currentBalance = await this.balanceDAO.find(this.data.id);
      this.maxExposure = currentBalance.balance + this.currentExposure;
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(`${this.data.name}'s Exposure Information (${this.data.denomination})`).end()
        .start().addClass(this.myClass('info-container'))
          .start(this.ValueCard, { title: this.EXPOSURE_CURRENT, value$: this.currentExposureFormatted$ }).end()
          .start(this.ValueCard, { title: this.EXPOSURE_MAX, value$: this.maxExposureFormatted$ }).end()
          .start(this.ValueCard, { title: this.EXPOSURE_UTILIZATION, value$: this.utilization$ }).end()
        .end()
        .start().addClass(this.myClass('info-container'))
          .start(this.ValueCard, { title: this.EXPOSURE_ALLOCATED, value$: this.allocatedExposureFormatted$ }).end()
          .start(this.ValueCard, { title: this.EXPOSURE_UNALLOCATED, value$: this.unallocatedExposureFormatted$ }).end()
          .start(this.ValueCard, { title: this.EXPOSURE_ALLOCATION_UTILIZATION, value$: this.allocationUtilization$ }).end()
        .end()
        .start().addClass(this.myClass('section-card'))
          .start('p').addClass(this.myClass('section')).add(this.RELATED_ACCOUNTS).end()
          .start({
            class: 'foam.u2.view.ScrollTableView',
            data$: this.predicatedDebtAccountDAO$,
            editColumnsEnabled: false,
            columns: [
              this.DebtAccount.DEBTOR_ACCOUNT.clone().copyFrom({
                label: 'Organization',
                tableCellFormatter: function(value, obj, axiom) {
                  self.accountDAO.find(value).then((debtor) => {
                    self.userDAO.find(debtor.owner).then((user) => {
                      this.start().add(user.organization).end();
                    }).catch(function(error){
                      this.start().add(debtor.id).end();
                    });
                  }).catch(function(error){
                    this.start().add(value).end();
                  });
                }
              }),
              this.DebtAccount.BALANCE.clone().copyFrom({
                label: 'Exposure',
                tableCellFormatter: function(value, obj, axiom) {
                  var currency = self.accountCurrency;
                  let self2 = this;
                  value = self.balanceDAO.find(obj.id).then(function (balance) {
                  if ( ! balance ) {
                    balance = 0;
                  } else {
                    balance = balance.balance;
                  }
                  if ( currency ) {
                    self2.start().add(currency.format(Math.abs(balance))).end();
                  } else {
                    self2.currencyDAO.find(self.data.denomination).then((curr) => {
                      self2.start().add(curr.format(Math.abs(balance))).end();
                    });
                  }
                });
                }
              }),
              this.DebtAccount.LIMIT.clone().copyFrom({
                label: 'Limit',
                tableCellFormatter: function(value, obj, axiom) {
                  var currency = self.accountCurrency;
                  if ( currency ) {
                    this.start().add(currency.format(value)).end();
                  } else {
                    self.currencyDAO.find(self.data.denomination).then((curr) => {
                      this.start().add(curr.format(value)).end();
                    });
                  }
                }
              })
            ]
          }).end()
        .end();

    }
  ]
});
