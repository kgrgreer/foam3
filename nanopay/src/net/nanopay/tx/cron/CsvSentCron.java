package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import net.nanopay.tx.alterna.AlternaSFTPService;
import net.nanopay.tx.alterna.CsvUtil;

import java.util.Calendar;

/**
 * Every business day this cronjob generates csv file with
 * CICO transactions and sends it to EftCanada.
 **/
public class CsvSentCron
  implements ContextAgent
{
  @Override
  public void execute(X x) {
    AlternaSFTPService sftp  = (AlternaSFTPService) x.get("alternaSftp");
    Calendar           today = Calendar.getInstance();

    // Only run in production environment
    if ( ((AppConfig) x.get("appConfig")).getMode() != Mode.PRODUCTION ) return;

    // Don't run on Saturday
    if ( today.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY ) return;

    // Don't run on Sunday
    if ( today.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY ) return;

    // Don't run on holidays
    if ( CsvUtil.cadHolidays.contains(today.get(Calendar.DAY_OF_YEAR)) ) return;

    sftp.sendCICOFile();
  }
}
