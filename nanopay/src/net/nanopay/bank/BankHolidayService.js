foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankHolidayService',

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Calendar',
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
      DAO bankHolidayDAO = (DAO) x.get("bankHolidayDAO");
      List bankHolidayList = ((ArraySink) bankHolidayDAO.where(
        AND(
          EQ(BankHoliday.COUNTRY_ID, address.getCountryId()),
          EQ(BankHoliday.REGION_ID, address.getRegionId())
        ))
        .select(new ArraySink())).getArray();
  
      List<LocalDate> holidayList = new ArrayList<>();
      for ( Object holidayObj : bankHolidayList ) {
        BankHoliday holiday = (BankHoliday) holidayObj;
        LocalDate bankHoliday = holiday.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        if ( ! bankHoliday.isBefore(LocalDate.now()) ) {
          holidayList.add(bankHoliday);
        }
      }
  
      LocalDate date = requestedDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      date = date.plusDays(offset);

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

        if ( (skipSaturday ? true : date.getDayOfWeek() != DayOfWeek.SATURDAY)
          && (skipSunday ? true : date.getDayOfWeek() != DayOfWeek.SUNDAY)
          && ! holidayList.contains(date) ) {
          break;
        }
          date = date.plusDays(1l);
      }
      return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});
