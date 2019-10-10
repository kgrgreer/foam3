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
    'foam.util.SafetyUtil',
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

        BankAccount bankAccount = findBankAccount(x, transaction);
        return ((BankHolidayService) getBankHolidayService()).skipBankHolidays(
          x, processDate, getAddress(x, bankAccount), totalClearingTime);
      `
    },
    {
      name: 'findBankAccount',
      type: 'BankAccount',
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
        if ( transaction instanceof CITransaction ) {
          return (BankAccount) transaction.findSourceAccount(x);
        }
        if ( transaction instanceof COTransaction ) {
          return (BankAccount) transaction.findDestinationAccount(x);
        }
        return null;
      `
    },
    {
      name: 'getAddress',
      type: 'Address',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'bankAccount',
          type: 'net.nanopay.bank.BankAccount'
        }
      ],
      javaCode: `
        Address address = new Address.Builder(x).setCountryId("CA").build();
        if ( bankAccount != null ) {
          if ( bankAccount.getAddress() != null ) {
            return bankAccount.getAddress();
          }
          if ( bankAccount.getBankAddress() != null ) {
            return bankAccount.getBankAddress();
          }
          address.setCountryId(bankAccount.getCountry());
        }
        return address;
      `
    }
  ]
});
