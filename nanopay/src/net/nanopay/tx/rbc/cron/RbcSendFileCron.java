package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import net.nanopay.tx.rbc.RbcFileProcessor;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;


public class RbcSendFileCron implements ContextAgent {

  protected Logger logger;

  @Override
  public void execute(X x) {

    /**
     * GET and send generated files
     */
    DAO eftFileDAO = (DAO) x.get("eftFileDAO");
    logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    ArraySink sink = (ArraySink) eftFileDAO.where(
      MLang.OR(
        MLang.EQ(EFTFile.STATUS, EFTFileStatus.GENERATED),
        MLang.EQ(EFTFile.STATUS, EFTFileStatus.FAILED)
      )
    ).select(new ArraySink());
    List<EFTFile> files = (ArrayList<EFTFile>) sink.getArray();

    for ( EFTFile file : files ) {
      /* Send and verify file */
      try {
        file = (EFTFile) file.fclone();
        new RbcFileProcessor(x).send(file);
      } catch ( Exception e ) {
        logger.error("RBC send file failed. " + e.getMessage(), e);
        ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
          .setName("RBC send file failed")
          .setReason(AlarmReason.TIMEOUT)
          .setNote(e.getMessage())
          .build());
        BmoFormatUtil.sendEmail(x, "RBC EFT Error sending and verifying EFT File. " + e.getMessage(), e);
      }
    }
  }
}
