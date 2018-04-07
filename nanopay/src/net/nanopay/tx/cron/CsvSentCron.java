package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.cico.spi.alterna.AlternaSFTPService;
import net.nanopay.cico.spi.alterna.CsvUtil;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;

public class CsvSentCron implements ContextAgent {

  @Override
  public void execute(X x){
    AlternaSFTPService sftp = (AlternaSFTPService) x.get("alternaSftp");
    List<Integer> cadHolidays = CsvUtil.cadHolidays;
    Calendar today = Calendar.getInstance();
    if ( today.get(Calendar.DAY_OF_WEEK) != 7 && today.get(Calendar.DAY_OF_WEEK) != 1 && !cadHolidays.contains(today.get(Calendar.DAY_OF_YEAR)) ) {
      sftp.sendCICOFile();
    }
  }
}
