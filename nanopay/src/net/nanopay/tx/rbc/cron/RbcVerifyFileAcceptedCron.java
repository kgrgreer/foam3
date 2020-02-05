package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.rbc.iso20022file.RbcISO20022File;
import net.nanopay.tx.rbc.RbcReportProcessor;


public class RbcVerifyFileAcceptedCron implements ContextAgent {

  protected Logger logger;

  @Override
  public void execute(X x) {

    /**
     * get sent files
     */
    DAO rbcISOFileDAO = (DAO) x.get("rbcISOFileDAO");
    logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    ArraySink sink = (ArraySink) rbcISOFileDAO.where(
      MLang.EQ(RbcISO20022File.STATUS, EFTFileStatus.SENT)
    ).select(new ArraySink());
    List<RbcISO20022File> files = (ArrayList<RbcISO20022File>) sink.getArray();

    for ( RbcISO20022File file : files ) {
      /* Verify file was accepted and valid */
      try {
        new RbcReportProcessor(x).processReceipt(file);
      } catch ( Exception e ) {
        logger.error("RBC send file failed.", e);
      } 
    }
  }
}
