package net.nanopay.tx.bmo.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.bmo.BmoReportProcessor;
import net.nanopay.tx.bmo.BmoSFTPClient;
import net.nanopay.tx.bmo.BmoSFTPCredential;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;

public class BmoGetReportCron implements ContextAgent {

  @Override
  public void execute(X x) {

    process(x);
  }

  public void process(X x) {
    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
    BmoSFTPCredential sftpCredential = (BmoSFTPCredential) x.get("bmoSFTPCredential");

    try {
      // 1. download
      new BmoSFTPClient(x, sftpCredential).downloadReports();

      // 2. process
      new BmoReportProcessor(x).processReports();

    } catch ( Exception e ) {
      logger.error("Error during process report file. ", e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("BMO EFT error during processing the report")
        .setReason(AlarmReason.TIMEOUT)
        .setNote(e.getMessage())
        .build());
      BmoFormatUtil.sendEmail(x, "BMO EFT error during processing the report", e);
    }
  }
}
