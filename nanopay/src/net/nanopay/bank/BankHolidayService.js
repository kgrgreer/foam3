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
      name: 'customBankWeekends'
    }
  ],

  methods: [
    {
      name: 'checkBankHoliday',
      type: 'Date',
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
          type: 'Long',
          name: 'offset',
          value: 0
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
      return getDate(localDate, ZoneOffset.UTC);
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
