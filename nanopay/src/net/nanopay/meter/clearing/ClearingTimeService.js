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
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTimeService',

  documentation: `ClearingTimeService supports estimating completion date of a
    transaction based on transaction clearing time and process date.`,

  imports: [
    'BankHolidayService bankHolidayService'
  ],

  javaImports: [
    'foam.nanos.auth.Address',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'net.nanopay.account.Account',
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
          .map(Long::intValue)
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
        Account acct =  transaction.findDestinationAccount(x);
        if ( ! (acct instanceof BankAccount) ) {
          acct = transaction.findSourceAccount(x);
        }
        return (BankAccount) acct;
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
