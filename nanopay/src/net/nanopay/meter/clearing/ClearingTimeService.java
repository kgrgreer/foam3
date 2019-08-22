package net.nanopay.meter.clearing;

import foam.core.X;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.model.Transaction;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class ClearingTimeService {
  /**
   * Estimate completion date of a transaction based on transaction clearingTime
   * and a specified processDate.
   *
   * The completion date should equal processDate + clearingTime (days). If it
   * lands on Saturday, Sunday and bank holidays then moves it the next day.
   *
   * @param x - the context
   * @param transaction - transaction to be estimated
   * @param processDate - date from which to start the calculation
   * @return The estimated completion date of the transaction
   */
  public Date estimateCompletionDate(X x, Transaction transaction, Date processDate) {
    int clearingTime = transaction.getClearingTime();
    LocalDate completionDate = processDate.toInstant()
      .atZone(ZoneId.systemDefault())
      .toLocalDate();
    // TODO: Use bankHolidayDAO instead of the hard-coded cadHolidays
    List<Integer> bankHolidays = CsvUtil.cadHolidays;

    int i = 0;
    while ( i < clearingTime ) {
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
  }

  /**
   * Estimate completion date of a transaction based on transaction clearingTime
   * and processDate.
   *
   * If transaction processDate is null then use today as the processDate.
   *
   * @param x - the context
   * @param transaction - transaction to be estimated
   * @return The estimated completion date of the transaction
   */
  public Date estimateCompletionDate(X x, Transaction transaction) {
    Date processDate = transaction.getProcessDate();
    if ( processDate == null ) {
      processDate = new Date();
    }
    return estimateCompletionDate(x, transaction, processDate);
  }
}
