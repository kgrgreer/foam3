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

import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.rbc.RbcReportProcessor;


public class RbcVerifyFileAcceptedCron implements ContextAgent {

  protected Logger logger;

  @Override
  public void execute(X x) {

    /**
     * get sent files
     */
    DAO eftFileDAO = (DAO) x.get("eftFileDAO");
    logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    ArraySink sink = (ArraySink) eftFileDAO.where(
      MLang.EQ(EFTFile.STATUS, EFTFileStatus.SENT)
    ).select(new ArraySink());
    List<EFTFile> files = (ArrayList<EFTFile>) sink.getArray();

    if (  files.size() > 0 ) {
      try {
        new RbcReportProcessor(x).processReceipts(files);
      } catch ( Exception e ) {
        logger.error("RBC send file failed.", e);
      }
    }
  }
}
