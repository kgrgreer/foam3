package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.RbcReportProcessor;

public class RbcProcessReportCron implements ContextAgent {
  protected RbcFTPSClient rbcFTPSClient;
  protected RbcReportProcessor reportProcessor;

  @Override
  public void execute(X x) {

    rbcFTPSClient = new RbcFTPSClient(x);
    reportProcessor = new RbcReportProcessor(x);
    process(x);
  }

  public void process(X x) {
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    try {
      // download status reports
      try{
        rbcFTPSClient.batchDownload();
      } catch (Exception e) {
        logger.error("Error downloading status reports from RBC ", e);
        throw e;
      }

      /* Decrypt status report files */
      try{
        reportProcessor.decryptFolder(x);
      } catch (Exception e) {
        logger.error("Error decrypting files from download folder", e);
        throw e;
      }       

      /* Process reports */
      try{
        reportProcessor.processReports();
      } catch (Exception e) {
        logger.error("Error processing reports from RBC ", e);
        throw e;
      }

    } catch ( Exception e ) {
      logger.error("Error during process report file. ", e);
      BmoFormatUtil.sendEmail(x, "RBC error during processing the payment report", e);
    }
  }
}
