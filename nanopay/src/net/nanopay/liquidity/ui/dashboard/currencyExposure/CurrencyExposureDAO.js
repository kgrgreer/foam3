foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'CurrencyExposureDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.ArraySink',
    'foam.dao.EasyDAO',
    'foam.dao.PromisedDAO',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'accountDAO',
    'balanceDAO',
    'baseDenomination',
    'fxService',
    'user'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'delegate',
      expression: function(baseDenomination, fxService, user) {
        var accountDenominationGroupBy = this.accountDAO
          .select(
            this.GROUP_BY(
              this.Account.DENOMINATION,
              this.MAP(this.Account.ID, this.ArraySink.create())));

        var accountDenominationMap = accountDenominationGroupBy
          .then(sink => {
            return sink.groupKeys.reduce((map, d) => {
              sink.groups[d].delegate.array.forEach(accountId => {
                map[accountId] = d;
              });
              return map;
            }, {});
          });

        var conversionRates = accountDenominationGroupBy
          .then(g => {
            var rates = {};
            return Promise.all(g.groupKeys.map(d => {
              return fxService.getFXRate(d, baseDenomination, 0, 1, 'BUY', null, user.id, 'localFXService').then(r => {
                rates[d] = r.rate;
              });
            })).then(_ => rates);
          });

        var balanceMap = this.balanceDAO.select()
          .then(sink => {
            return sink.array.reduce((map, b) => {
              map[b.account] = b.balance;
              return map;
            }, {});
          });

        var dao = this.EasyDAO.create({
          of: this.CurrencyExposure,
          daoType: 'MDAO'
        });

        var p = Promise.all([
          accountDenominationMap,
          conversionRates,
          balanceMap
        ]).then(a => {
          var accountDenominationMap = a[0];
          var conversionRates = a[1];
          var balanceMap = a[2];

          var buckets = Object.keys(accountDenominationMap).reduce((buckets, accountId) => {
            var d = accountDenominationMap[accountId];
            buckets[d] = buckets[d] || 0;
            buckets[d] += balanceMap[accountId] || 0;
            return buckets;
          }, {});

          return Promise.all(Object.keys(buckets).map(d => {
            return dao.put(this.CurrencyExposure.create({
              denomination: d,
              total: buckets[d] * conversionRates[d]
            }));
          }))
        }).then(_ => {
          return dao;
        });

        return this.PromisedDAO.create({
          promise: p,
          of: this.CurrencyExposure
        });
      }
    }
  ]
});
