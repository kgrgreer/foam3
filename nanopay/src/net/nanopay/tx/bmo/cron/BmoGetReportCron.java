package net.nanopay.tx.bmo.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.bmo.BmoReportProcessor;
import net.nanopay.tx.bmo.BmoSFTPClient;
import net.nanopay.tx.bmo.BmoSFTPCredential;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.IOException;
import java.util.List;

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

      // 3. post process
      new BmoReportProcessor(x).postProcessReport();
    } catch ( Exception e ) {
      logger.error("Error during process report file. ", e);
      BmoFormatUtil.sendEmail(x, "BMO EFT error during processing the report", e);
    }
  }
}
