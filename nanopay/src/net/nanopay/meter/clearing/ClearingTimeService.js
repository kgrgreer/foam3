foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimeService',

  documentation: `ClearingTimeService supports estimating completion date of a
    transaction based on transaction clearing time and process date.`,

  imports: [
    'bankHolidayService'
  ],

  javaImports: [
    'foam.nanos.auth.Address',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankHolidayService',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
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
        Logger logger = (Logger) x.get("logger");
        if ( ! (transaction instanceof ClearingTimesTrait) ) {
          String message = String.format(
            "Transaction %s does not support custom clearing", transaction.getId());
          logger.debug(message, transaction);
          return null;
        }

        ClearingTimesTrait trait = (ClearingTimesTrait) transaction;
        int totalClearingTime = trait.getClearingTimes().values().stream()
          .reduce(0, Integer::sum);
        if ( trait.getClearingTimes().isEmpty()
          || totalClearingTime < 0
        ) {
          String message = String.format(
            "Transaction %s has %s clearing time. Use %d-day defaultClearingTime instead.",
            transaction.getId(),
            totalClearingTime == 0 ? "no" : Integer.toString(totalClearingTime),
            getDefaultClearingTime());
          ((Logger) x.get("logger")).warning(message, transaction);

          totalClearingTime = getDefaultClearingTime();
        }

        return ((BankHolidayService) getBankHolidayService()).skipBankHolidays(
          x, processDate, findBankAddress(x, transaction), totalClearingTime);
      `
    },
    {
      name: 'findBankAddress',
      type: 'Address',
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
        if ( ! (transaction instanceof CITransaction)
          && ! (transaction instanceof COTransaction)
        ) {
          return new Address.Builder(x)
            .setCountryId("CA")
            .build();
        }

        BankAccount bankAccount = transaction instanceof CITransaction
          ? (BankAccount) transaction.findSourceAccount(x)
          : (BankAccount) transaction.findDestinationAccount(x);

        if ( bankAccount.getAddress() != null ) {
          return bankAccount.getAddress();
        }
        if ( bankAccount.getBankAddress() != null ) {
          return bankAccount.getBankAddress();
        }
        return new Address.Builder(x)
          .setCountryId(bankAccount.getCountry())
          .build();
      `
    }
  ]
});
