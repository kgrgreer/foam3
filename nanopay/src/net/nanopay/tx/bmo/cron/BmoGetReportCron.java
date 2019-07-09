package net.nanopay.tx.bmo.cron;

import foam.core.ContextAgent;
import foam.core.X;
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
    BmoSFTPCredential sftpCredential = (BmoSFTPCredential) x.get("bmoSFTPCredential");

    // 1. download
    new BmoSFTPClient(x, sftpCredential).downloadReports();

    // 2. process
    new BmoReportProcessor(x).processReports();

    // 3. post process
    new BmoReportProcessor(x).postProcessReport();

  }
}
