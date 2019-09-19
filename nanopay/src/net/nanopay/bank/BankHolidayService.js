foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankHolidayService',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
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
        }
      ],
      javaCode: `
      LocalDate localDate = requestedDate.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
      DAO bankHolidayDAO = (DAO) x.get("bankHolidayDAO");
      List<Date> bankHolidayList = ((ArraySink) ((foam.mlang.sink.Map)
        bankHolidayDAO
          .where(AND(
            EQ(BankHoliday.COUNTRY_ID, address.getCountryId()),
            EQ(BankHoliday.REGION_ID, address.getRegionId()),
            GTE(BankHoliday.DATE, getDate(localDate, ZoneOffset.UTC))))
          .select(MAP(BankHoliday.DATE, new ArraySink()))).getDelegate()).getArray();

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
  ]
});
