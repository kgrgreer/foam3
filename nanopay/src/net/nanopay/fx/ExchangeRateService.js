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
  package: 'net.nanopay.fx',
  name: 'ExchangeRateService',

  implements: [
    'net.nanopay.fx.ExchangeRateServiceInterface'
  ],

  imports: [
    'currencyDAO',
    'securitiesDAO',
    'securityPriceDAO',
    'exchangeRateDAO'

  ],

  javaImports: [
    'foam.core.ContextAwareSupport',
    'foam.core.Currency',
    'foam.core.Unit',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.exchangeable.Security'
  ],

  requires: [
    'foam.core.Currency',
    'foam.core.Unit',
    'net.nanopay.exchangeable.Security',
    'net.nanopay.fx.ExchangeRate',
    'net.nanopay.fx.SecurityPrice'
  ],

  methods: [
    {
      name: 'exchange',
      args: [
        { name: 'u1', type: 'String' },
        { name: 'u2', type: 'String' },
        { name: 'amount', type: 'Long' }
      ],
      type: 'Long',
      javaCode:`
        return (long) Math.floor(amount * getRateAndFormat_(u1,u2));
      `,
      code: async function exchange(u1, u2, amount){
        return Math.floor(amount * await this.getRateAndFormat_(u1,u2));
      }
    },
    {
      name: 'exchangeFormat',
      args: [
        { name: 'u1', type: 'String' },
        { name: 'u2', type: 'String' },
        { name: 'amount', type: 'Long' }
      ],
      type: 'String',
      code: async function exchangeFormat(u1, u2, amount) {
        var unit = await this.findUnit_(u2);
        return unit.format((await this.exchange(u1, u2, amount)));
      },
      javaCode: `
        Unit unit = findUnit_(u2);
        return unit.format(exchange(u1, u2, amount));
      `,
    },
    {
      name: 'getRate',
      args: [
        { name: 'u1', type: 'String' },
        { name: 'u2', type: 'String' }
      ],
      type: 'Double',
      javaCode: `
        if (SafetyUtil.equals(u1, u2)) return 1;
        Unit unit1 = findUnit_(u1);
        Unit unit2 = findUnit_(u2);
        return getRate_(unit1, unit2);
      `,
      code: async function getRate(u1, u2){
        if (u1 == u2) return 1;
        var unit1 = await this.findUnit_(u1);
        var unit2 = await this.findUnit_(u2);
        return this.getRate_(unit1, unit2);
      }
    },
    {
      name: 'getRateAndFormat_',
      args: [
        { name: 'u1', type: 'String' },
        { name: 'u2', type: 'String' }
      ],
      type: 'Double',
      javaCode: `
      if (SafetyUtil.equals(u1, u2)) return 1;
        Unit unit1 = findUnit_(u1);
        Unit unit2 = findUnit_(u2);
       return (getRate_(unit1, unit2) / Math.pow(10,unit1.getPrecision())) * Math.pow(10,unit2.getPrecision());
      `,
      code: async function getRateAndFormat_(u1, u2){
        if ( u1 == u2 ) return 1;
        var unit1 = await this.findUnit_(u1);
        var unit2 = await this.findUnit_(u2);
        return (await this.getRate_(unit1, unit2) / Math.pow(10,unit1.precision)) * Math.pow(10,unit2.precision);
      }
    },
    {
      name: 'getRate_',
      args: [
        { name: 'unit1', type: 'foam.core.Unit' },
        { name: 'unit2', type: 'foam.core.Unit' }
      ],
      type: 'Double',
      javaCode: `
        double rate;
        try { rate = getFromDAOs_(unit1, unit2); }
        catch(Exception e) {
          try { rate = 1 / getFromDAOs_(unit2, unit1); }
          catch(Exception e2) {
            try {
              if (SafetyUtil.equals(unit1.getId(),"USD") || SafetyUtil.equals(unit2.getId(),"USD"))
                throw new RuntimeException("No rate found");
              double r1 = getRate(unit1.getId(), "USD");
              double r2 = getRate("USD", unit2.getId());
              rate = r1 * r2;
            }
            catch(Exception e3){
              throw e;
            }
          }
        }
        return rate;
      `,
      code: async function getRate_(unit1, unit2){
        var rate;
        try { rate = await this.getFromDAOs_(unit1, unit2); }
        catch(e) {
          try { rate = 1 / await this.getFromDAOs_(unit2, unit1); }
          catch(e2) {
            try {
              if ( (unit1.id == 'USD') || (unit2.id == 'USD') )
                throw new Error('No rate found');
              var r1 = await this.getRate(unit1.id, 'USD');
              var r2 = await this.getRate('USD', unit2.id);
              rate = r1 * r2;
            }
            catch(e3){
              throw e;
            }
          }
        }
        return rate;
      }
    },
    {
      name: 'getFromDAOs_',
      args: [
        { name: 'u1', type: 'foam.core.Unit' },
        { name: 'u2', type: 'foam.core.Unit' }
      ],
      type: 'Double',
      javaCode: `
        double rate = 0;
        if (u1 instanceof Currency) {
          if ( u2 instanceof Currency) {
            ExchangeRateId id = new ExchangeRateId();
            id.setFromCurrency(u1.getId());
            id.setToCurrency(u2.getId());
            ExchangeRate er = (ExchangeRate) ((DAO) getX().get("exchangeRateDAO")).find(id);
            if (er != null) {
              return er.getRate();
            }
            throw new RuntimeException("Rate Not Found for: "+ u1.getId() + " and " + u2.getId());
          }
          if ( u2 instanceof Security ) {
            SecurityPriceId id = new SecurityPriceId();
            id.setSecurity(u2.getId());
            id.setCurrency(u1.getId());
            SecurityPrice sp = (SecurityPrice) ((DAO) getX().get("securityPriceDAO")).find(id);
            if (sp != null) {
              return sp.getPrice();
            }
            throw new RuntimeException("Rate Not Found for: " + u2.getId() + " and " + u1.getId());
          }

        }
        if (u1 instanceof Security) {
          if (u2 instanceof Currency) {
            SecurityPriceId id = new SecurityPriceId();
            id.setSecurity(u1.getId());
            id.setCurrency(u2.getId());
            SecurityPrice sp = (SecurityPrice) ((DAO) getX().get("securityPriceDAO")).find(id);
            if (sp != null) {
              return sp.getPrice();
            }
            throw new RuntimeException("Rate Not Found for: " + u1.getId() + " and " + u2.getId());
          }
          if (u2 instanceof Security) {
            throw new RuntimeException("Security to Security not supported for: " + u1.getId() + " and " + u2.getId());
          }
        }
        return rate;
      `,
      code: async function getFromDAOs_(u1, u2){
        var rate;
        if (this.Currency.isInstance(u1)) {
          if (this.Currency.isInstance(u2)) {
            // Accessing the ExchangeRate class to compile the ExchangeRateId
            // which is required on the next line. Keep this line in here or
            // the ExchangeRateId class will not be modeled and generated on 
            // the fly.
            var pre = net.nanopay.fx.ExchangeRate.create();

            var id = net.nanopay.fx.ExchangeRateId.create();
            id.fromCurrency = u1.id;
            id.toCurrency = u2.id;
            var er =  await this.exchangeRateDAO.find(id);
            if (er != null) {
              return er.rate;
            }
            throw new Error('Rate Not Found for: '+ u1.id + ' and ' + u2.id);
          }
          if (this.Security.isInstance(u2) ) {
            // Accessing the SecurityPrice class to compile the ExchangeRateId
            // which is required on the next line. Keep this line in here or
            // the SecurityPriceId class will not be modeled and generated on 
            // the fly.
            var pre = net.nanopay.fx.SecurityPrice.create();

            var id = net.nanopay.fx.SecurityPriceId.create();
            id.security = u2.id;
            id.currency = u1.id;
            var sp = await this.securityPriceDAO.find(id);
            if (sp != null) {
              return sp.price;
            }
            throw new Error('Rate Not Found for: ' + u2.id + ' and ' + u1.id);
          }
        }
        if ( this.Security.isInstance(u1)) {
          if (this.Currency.isInstance(u2)) {
            // Accessing the SecurityPrice class to compile the ExchangeRateId
            // which is required on the next line. Keep this line in here or
            // the SecurityPriceId class will not be modeled and generated on 
            // the fly.
            var pre = net.nanopay.fx.SecurityPrice.create();

            var id = net.nanopay.fx.SecurityPriceId.create();
            id.security = u1.id;
            id.currency = u2.id;
            var sp = await this.securityPriceDAO.find(id);
            if (sp != null) {
              return sp.price;
            }
            throw new Error('Rate Not Found for: ' + u1.id + ' and ' + u2.id);
          }
          if (this.Security.isInstance(u2)) {
            throw new Error('Security to Security not supported for: ' + u1.id + ' and ' + u2.id);
          }
        }
        return rate;
      }
    },
    {
      name: 'findUnit_',
      args: [
        { name: 's', type: 'String' }
      ],
      type: 'foam.core.Unit',
      javaCode: `
        Object s1 = ((DAO) getX().get("currencyDAO")).find(s);
        if (s1 == null)
          s1 = ((DAO) getX().get("securitiesDAO")).find(s);
        if (s1 == null)
          throw new RuntimeException("Neither currency nor Security of " + s1 + " was found.");
        return (Unit) s1;
      `,
      code: async function findUnit_(s) {
        var s1 = await this.currencyDAO.find(s);
        if (s1 == null)
          s1 = await this.securitiesDAO.find(s);
        if (s1 == null)
          throw new Error('Neither currency nor Security of ' + s1 + ' was found.');
        return s1;
      }
    },
  ]

})
