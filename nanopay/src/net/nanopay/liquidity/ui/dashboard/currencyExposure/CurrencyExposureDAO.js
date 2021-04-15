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
    'fxService',
    'filteredAccountDAO?',
    'accountDAO',
    'balanceDAO',
    'homeDenomination',
    'exchangeRateService',
    'user'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'delegate',
      expression: function(homeDenomination, fxService, exchangeRateService, user, filteredAccountDAO, accountDAO) {
        var daoToUse = filteredAccountDAO ? filteredAccountDAO : accountDAO;
        var accountDenominationGroupBy = daoToUse
          .select(
            this.GROUP_BY(
              this.Account.DENOMINATION,
              this.MAP(this.Account.ID, this.ArraySink.create())
            )
          );

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
              return exchangeRateService.getRate(d, homeDenomination).then(r => {
                rates[d] = r;
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
            buckets[d] += balanceMap[accountId] > 0 ? balanceMap[accountId] || 0 : 0;
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
