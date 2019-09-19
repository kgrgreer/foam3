package net.nanopay.bank.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import net.nanopay.bank.BankHoliday;
import net.nanopay.bank.BankHolidayService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import static foam.mlang.MLang.*;

public class BankHolidayServiceTest extends foam.nanos.test.Test {
  private final LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);

  private BankHolidayService bankHolidayService;
  private DAO bankHolidayDAO;
  private Address ca_ON;

  public void runTest(X x) {
    bankHolidayService = (BankHolidayService) x.get("bankHolidayService");
    bankHolidayDAO = (DAO) x.get("bankHolidayDAO");
    ca_ON = new Address.Builder(x)
      .setCountryId("CA")
      .setRegionId("ON")
      .build();

    setUpBankHoliday(x);
    testSkipHoliday(x);
  }

  private void testSkipHoliday(X x) {
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan1_2020), ca_ON, 0);
    Date expected = getDate(jan1_2020.plus(1, ChronoUnit.DAYS));

    test(expected.equals(result), "Should skip bank holiday");
  }

  private void setUpBankHoliday(X x) {
    Date holiday = Date.from(jan1_2020.atStartOfDay(ZoneOffset.UTC).toInstant());
    if ( null == bankHolidayDAO.find(AND(
                   EQ(BankHoliday.COUNTRY_ID, "CA"),
                   EQ(BankHoliday.REGION_ID, "ON"),
                   GTE(BankHoliday.DATE, holiday)))
    ) {
      bankHolidayDAO.put(new BankHoliday.Builder(x)
        .setCountryId("CA")
        .setRegionId("ON")
        .setDate(holiday)
        .build()
      );
    }
  }

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
