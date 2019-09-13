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
    'static foam.mlang.MLang.*'
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
          type: 'String',
          name: 'countryId'
        },
        {
          type: 'String',
          name: 'regionId'
        },
        {
          type: 'Date',
          name: 'requestedDate'
        }
      ],
      javaCode: `
      DAO bankHolidayDAO = (DAO) x.get("bankHolidayDAO");
      List bankHolidayList = ((ArraySink) bankHolidayDAO.where(
        AND(
          EQ(BankHoliday.COUNTRY_ID, countryId),
          EQ(BankHoliday.REGION_ID, regionId)
        ))
        .select(new ArraySink())).getArray();
  
      List<LocalDate> holidayList = new ArrayList<>();
      for ( Object holidayObj : bankHolidayList ) {
        BankHoliday holiday = (BankHoliday) holidayObj;
        holidayList.add(holiday.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
      }
  
      LocalDate date = requestedDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      while ( true ) {

        if ( date.getDayOfWeek() != DayOfWeek.SATURDAY
          && date.getDayOfWeek() != DayOfWeek.SUNDAY
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
