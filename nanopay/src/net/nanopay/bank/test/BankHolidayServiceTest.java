package net.nanopay.bank.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import net.nanopay.bank.BankHoliday;
import net.nanopay.bank.BankHolidayService;
import net.nanopay.bank.BankWeekend;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
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
    Test_SkipHoliday(x);
    Test_SkipWeekend(x);
    Test_SkipOffset(x);
    Test_SkipHolidayWeekendAndOffset(x);
    Test_SkipCountryWideHoliday(x);
    Test_NoSkipBusinessDay(x);
    Test_SkipCustomWeekend(x);
  }

  private void Test_SkipHoliday(X x) {
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan1_2020), ca_ON, 0);
    Date expected = getDate(jan1_2020.plusDays(1));

    test(expected.equals(result), "Should skip bank holiday");
  }

  private void Test_SkipWeekend(X x) {
    LocalDate saturdayLocalDate = jan1_2020.with(TemporalAdjusters.next(DayOfWeek.SATURDAY));

    Date result = bankHolidayService.skipBankHolidays(x, getDate(saturdayLocalDate), ca_ON, 0);
    Date expected = getDate(saturdayLocalDate.plusDays(2));

    test(expected.equals(result), "Should skip weekend");
  }

  private void Test_SkipOffset(X x) {
    LocalDate jan2_2020 = jan1_2020.plusDays(1);
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan2_2020), ca_ON, 1);
    Date expected = getDate(jan2_2020.plusDays(1));

    test(expected.equals(result), "Should skip offset days");
  }

  private void Test_SkipHolidayWeekendAndOffset(X x) {
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan1_2020), ca_ON, 2);
    Date expected = getDate(jan1_2020.plusDays(1 + 2 + 2)); // 1 holiday, 2 offset days, 2 days for Saturday and Sunday

    test(expected.equals(result), "Should skip bank holiday, weekend and offset days");
  }

  private void Test_SkipCountryWideHoliday(X x) {
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan1_2020), ca_ON, 4);
    Date expected = getDate(jan1_2020.plusDays(2 + 4 + 2)); // 2 holidays, 2 offset days, 2 days for Saturday and Sunday

    test(expected.equals(result), "Should skip bank holiday(country-wide), weekend and offset days");
  }

  private void Test_NoSkipBusinessDay(X x) {
    LocalDate jan2_2020 = jan1_2020.plusDays(1);
    Date result = bankHolidayService.skipBankHolidays(x, getDate(jan2_2020), ca_ON, 0);
    Date expected = getDate(jan2_2020);

    test(expected.equals(result), "Should not skip business day");
  }

  private void Test_SkipCustomWeekend(X x) {
    BankWeekend[] oldBankWeekends = bankHolidayService.getCustomBankWeekends();
    bankHolidayService.setCustomBankWeekends(new BankWeekend[] {
      new BankWeekend.Builder(x)
        .setCountryId("CN")
        .setSunday(false)
        .build()
    });
    Address cn = new Address.Builder(x)
      .setCountryId("CN")
      .build();
    LocalDate saturdayLocalDate = jan1_2020.with(TemporalAdjusters.next(DayOfWeek.SATURDAY));

    Date result = bankHolidayService.skipBankHolidays(x, getDate(saturdayLocalDate), cn, 0);
    Date expected = getDate(saturdayLocalDate.plusDays(1));

    test(expected.equals(result), "Should skip custom weekend based on country/region");
    bankHolidayService.setCustomBankWeekends(oldBankWeekends);
  }

  private void setUpBankHoliday(X x) {
    Date holiday = Date.from(jan1_2020.atStartOfDay(ZoneOffset.UTC).toInstant());
    Date CAHoliday = Date.from(jan1_2020.plusDays(7).atStartOfDay(ZoneOffset.UTC).toInstant());
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
      bankHolidayDAO.put(new BankHoliday.Builder(x)
        .setCountryId("CA")
        .setDate(CAHoliday)
        .build()
      );
    }
  }

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
