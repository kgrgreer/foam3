foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimeService',

  documentation: `ClearingTimeService supports estimating completion date of a
    transaction based on transaction clearing time and process date.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.tx.alterna.CsvUtil'
  ],

  properties: [
    {
      class: 'Int',
      name: 'defaultClearingTime',
      documentation: 'Default clearing time (in days).',
      value: 2
    }
  ],

  methods: [
    {
      name: 'estimateCompletionDateSimple',
      type: 'Date',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        Date processDate = transaction.getProcessDate();
        if ( processDate == null ) {
          processDate = new Date();
        }
        return estimateCompletionDate(x, transaction, processDate);
      `
    },
    {
      name: 'estimateCompletionDate',
      type: 'Date',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'processDate',
          type: 'Date'
        }
      ],
      javaCode: `
        int totalClearingTime = transaction.getClearingTimes().values().stream()
          .reduce(0, Integer::sum);
        if ( transaction.getClearingTimes().isEmpty()
          || totalClearingTime < 0
        ) {
          String message = String.format(
            "Transaction %s has %s clearing time. Use defaultClearingTime (%d) instead.",
            transaction.getId(),
            totalClearingTime == 0 ? "no" : Integer.toString(totalClearingTime),
            getDefaultClearingTime());
          ((Logger) x.get("logger")).warning(message, transaction);

          totalClearingTime = getDefaultClearingTime();
        }
        LocalDate completionDate = processDate.toInstant()
          .atZone(ZoneId.systemDefault())
          .toLocalDate();
        // TODO: Use bankHolidayDAO instead of the hard-coded cadHolidays
        List<Integer> bankHolidays = CsvUtil.cadHolidays;

        int i = 0;
        while ( i < totalClearingTime ) {
          completionDate = completionDate.plusDays(1);
          if ( completionDate.getDayOfWeek() != DayOfWeek.SATURDAY
            && completionDate.getDayOfWeek() != DayOfWeek.SUNDAY
            && ! bankHolidays.contains(completionDate.getDayOfYear())
          ) {
            i = i + 1;
          }
        }
        return Date.from(completionDate.atStartOfDay()
          .atZone(ZoneId.systemDefault())
          .toInstant());
      `
    }
  ]
});
