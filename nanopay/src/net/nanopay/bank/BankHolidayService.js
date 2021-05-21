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
  package: 'net.nanopay.bank',
  name: 'BankHolidayService',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.util.SafetyUtil',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.time.ZoneOffset',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.bank.BankWeekend',
      name: 'customBankWeekends',
      documentation: 'Customize country/regional bank weekends'
    },
    {
      class: 'Int',
      name: 'window',
      value: 1,
      documentation: 'Default window in months'
    }
  ],

  methods: [
    {
      name: 'skipBankHolidays',
      type: 'Date',
      documentation: `
        Skip bank holidays, weekend and "offset" number of business days for a
        given requestedDate.

        Arguments:
          - x             : Context object
          - requestedDate : Requested date to check against applicable holidays
          - address       : For determining applicable bank holidays and weekend
          - offset        : The number of business days to skip
          - window        : Limit holidays to consider to a window period in months

        Eg.

          skipBankHoliday(x, january1_2020, ontario, 0); //  returns 2020-01-02 (Thursday)
          skipBankHoliday(x, january1_2010, ontario, 1); //  returns 2020-01-03 (Friday)
          skipBankHoliday(x, january1_2010, ontario, 2); //  returns 2020-01-06 (Monday) because weekend 04 and 05 are skipped

        See more cases in BankHolidayServiceTest.
      `,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'Date',
          name: 'requestedDate'
        },
        {
          type: 'foam.nanos.auth.Address',
          name: 'address'
        },
        {
          type: 'Integer',
          name: 'offset'
        },
        {
          type: 'Integer',
          name: 'window'
        }
      ],
      javaCode: `
      LocalDate localDate = requestedDate.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
      Date limit = getDate(localDate.plusMonths(window), ZoneOffset.UTC);
      List<Date> bankHolidayList = getBankHolidays(x, address, limit, getDate(localDate, ZoneOffset.UTC));
      BankWeekend bankWeekend = findBankWeekend(address);
      while ( true ) {
        if ( ! (bankWeekend.getSaturday() && localDate.getDayOfWeek() == DayOfWeek.SATURDAY)
          && ! (bankWeekend.getSunday() && localDate.getDayOfWeek() == DayOfWeek.SUNDAY)
          && ! bankHolidayList.contains(getDate(localDate, ZoneOffset.UTC))
          && --offset < 0
        ) {
          break;
        }
        localDate = localDate.plusDays(1);
      }
      return getDate(localDate, ZoneId.systemDefault());
      `
    },
    {
      name: 'skipBankHolidaysBackwards',
      type: 'Date',
      documentation: `
        Skip bank holidays, weekend backwards for a given requestedDate.

        Arguments:
          - x             : Context object
          - requestedDate : Requested date to check against applicable holidays
          - address       : For determining applicable bank holidays and weekend
          - offset        : The number of business days to skip
          - window        : Limit holidays to consider to a window period in months
      `,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'Date',
          name: 'requestedDate'
        },
        {
          type: 'foam.nanos.auth.Address',
          name: 'address'
        },
        {
          type: 'Integer',
          name: 'offset'
        },
        {
          type: 'Integer',
          name: 'window'
        }
      ],
      javaCode: `
      LocalDate localDate = requestedDate.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
      Date limit = getDate(localDate.minusMonths(window), ZoneOffset.UTC);
      List<Date> bankHolidayList = getBankHolidays(x, address, getDate(localDate, ZoneOffset.UTC), limit);
      BankWeekend bankWeekend = findBankWeekend(address);
      while ( true ) {
        if ( ! (bankWeekend.getSaturday() && localDate.getDayOfWeek() == DayOfWeek.SATURDAY)
          && ! (bankWeekend.getSunday() && localDate.getDayOfWeek() == DayOfWeek.SUNDAY)
          && ! bankHolidayList.contains(getDate(localDate, ZoneOffset.UTC))
          && --offset < 0
        ) {
          break;
        }
        localDate = localDate.minusDays(1);
      }
      return getDate(localDate, ZoneId.systemDefault());
      `
    },
    {
      name: 'getBankHolidays',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'foam.nanos.auth.Address',
          name: 'address'
        },
        {
          name: 'max',
          type: 'Date'
        },
        {
          name: 'min',
          type: 'Date'
        }
      ],
      javaCode: `
        DAO bankHolidayDAO = (DAO) x.get("bankHolidayDAO");
        return ((ArraySink) ((foam.mlang.sink.Map)
        bankHolidayDAO
          .where(
            AND(
              OR(
                AND(
                  EQ(BankHoliday.COUNTRY_ID, address.getCountryId()),
                  EQ(BankHoliday.REGION_ID, address.getRegionId())
                ),
              AND(
                EQ(BankHoliday.COUNTRY_ID, address.getCountryId()),
                EQ(BankHoliday.REGION_ID, "")
              )
            ),
              LTE(BankHoliday.DATE, max),
              GTE(BankHoliday.DATE, min)))
          .select(MAP(BankHoliday.DATE, new ArraySink()))).getDelegate()).getArray();
      `
    },
    {
      name: 'getDate',
      type: 'Date',
      args: [
        {
          name: 'localDate',
          type: 'java.time.LocalDate'
        },
        {
          name: 'zone',
          type: 'java.time.ZoneId'
        }
      ],
      javaCode: `
        return Date.from(localDate.atStartOfDay(zone).toInstant());
      `
    },
    {
      name: 'findBankWeekend',
      type: 'net.nanopay.bank.BankWeekend',
      args: [
        {
          name: 'address',
          type: 'foam.nanos.auth.Address'
        }
      ],
      javaCode: `
        BankWeekend ret = new BankWeekend();
        for ( BankWeekend bankWeekend : getCustomBankWeekends() ) {
          String regionId = bankWeekend.getRegionId();
          if ( regionId.equals(address.getRegionId()) ) {
            return bankWeekend;
          }

          // Check for country wide bank weekend
          if ( bankWeekend.getCountryId().equals(address.getCountryId())
            && SafetyUtil.isEmpty(regionId)
          ) {
            ret = bankWeekend;
          }
        }
        return ret;
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public Date skipBankHolidays(X x, Date requestedDate, Address address, int offset) {
            return skipBankHolidays(x, requestedDate, address, offset, getWindow());
          }

          public Date skipBankHolidaysBackwards(X x, Date requestedDate, Address address, int offset) {
            return skipBankHolidaysBackwards(x, requestedDate, address, offset, getWindow());
          }
        `);
      },
    },
  ]
});
