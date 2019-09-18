foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankHolidayService',

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.time.ZoneOffset',
    'java.util.Date',
    'java.util.List',
    'java.util.ArrayList',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'net.nanopay.bank.BankHolidayEnum'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.bank.BankHolidayWeekendModifiers',
      name: 'holidayExecptions'
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

      Boolean skipSaturday = false;
      Boolean skipSunday = false;
      for ( BankHolidayWeekendModifiers object : getHolidayExecptions() ) {
        //check for country wide rule
        if ( object.getCountryId().equals(address.getCountryId()) && object.getRegionId().equals("") ) {
          skipSaturday = object.getBankHolidayEnum() == BankHolidayEnum.SATURDAY || object.getBankHolidayEnum() == BankHolidayEnum.BOTH;
          skipSunday = object.getBankHolidayEnum() == BankHolidayEnum.SUNDAY || object.getBankHolidayEnum() == BankHolidayEnum.BOTH;
        }
        //check for region rule, overides country rule
        if ( object.getRegionId().equals(address.getRegionId()) ) {
          skipSaturday = object.getBankHolidayEnum() == BankHolidayEnum.SATURDAY || object.getBankHolidayEnum() == BankHolidayEnum.BOTH;
          skipSunday = object.getBankHolidayEnum() == BankHolidayEnum.SUNDAY || object.getBankHolidayEnum() == BankHolidayEnum.BOTH;
          break;
        }
      }
      while ( true ) {
        if ( (skipSaturday ? true : localDate.getDayOfWeek() != DayOfWeek.SATURDAY)
          && (skipSunday ? true : localDate.getDayOfWeek() != DayOfWeek.SUNDAY)
          && ! bankHolidayList.contains(getDate(localDate, ZoneOffset.UTC)) ) {
          if ( offset > 0 ) {
            offset--;
          } else {
            break;
          }
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
    }
  ]
});
