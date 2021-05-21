package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.log.LogLevel;
import foam.mlang.MLang;
import foam.nanos.alarming.Alarm;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.RbcReportProcessor;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import static foam.mlang.MLang.*;

public class RbcProcessReportCron implements ContextAgent {
  protected RbcFTPSClient rbcFTPSClient;
  protected RbcReportProcessor reportProcessor;

  @Override
  public void execute(X x) {
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    try {
      rbcFTPSClient = new RbcFTPSClient(x);
      reportProcessor = new RbcReportProcessor(x);
      process(x);
    } catch ( Exception e ) {
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      String name = "RbcProcessReportCron-Status";
      String note = "RbcProcessReportCron Exception: " + e.getMessage();
      Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
      alarmDAO.put(alarm);
      logger.error(name, e);
    }
  }

  public void process(X x) {
    DAO eftFileDAO = (DAO) x.get("eftFileDAO");
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    ArraySink sink = (ArraySink) eftFileDAO.where(
      MLang.EQ(EFTFile.STATUS, EFTFileStatus.ACCEPTED)
    ).select(new ArraySink());
    List<EFTFile> files = (ArrayList<EFTFile>) sink.getArray();

    if (  files.size() > 0 ) {
      try {
        // download status reports
        try {
          reportProcessor.downloadReports(files);
        } catch (Exception e) {
          logger.error("Error downloading status reports from RBC ", e);
          throw e;
        }

        /* Decrypt status report files */
        try {
          reportProcessor.decryptFolder(x);
        } catch (Exception e) {
          logger.error("Error decrypting files from download folder", e);
          throw e;
        }

        /* Process reports */
        try {
          reportProcessor.processReports();
        } catch (Exception e) {
          logger.error("Error processing reports from RBC ", e);
          throw e;
        }
      } catch ( Exception e ) {
        DAO alarmDAO = (DAO) x.get("alarmDAO");
        String name = "RbcProcessingReportError-Processing";
        String note = "RBC error during processing the payment report: " + e.getMessage();
        Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
        alarmDAO.put(alarm);
        logger.error(name, e);
      }
    }
  }
}
