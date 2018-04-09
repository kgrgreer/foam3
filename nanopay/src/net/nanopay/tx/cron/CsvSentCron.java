package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.cico.spi.alterna.AlternaSFTPService;
import net.nanopay.cico.spi.alterna.CsvUtil;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;

/**
 * Every business day this cronjob generates csv file with
 * CICO transactions and sends it to EftCanada.
 **/
public class CsvSentCron
  implements ContextAgent
{
  @Override
  public void execute(X x){
    AlternaSFTPService sftp  = (AlternaSFTPService) x.get("alternaSftp");
    Calendar           today = Calendar.getInstance();

    // Don't run on Saturday
    if ( today.get(Calendar.DAY_OF_WEEK) == 7 ) return;

    // Don't run on Sunday
    if ( today.get(Calendar.DAY_OF_WEEK) == 1 ) return;

    // Don't run on holidays
    if ( CsvUtil.cadHolidays.contains(today.get(Calendar.DAY_OF_YEAR)) ) return;

    sftp.sendCICOFile();
  }
}
