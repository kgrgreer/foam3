package net.nanopay.tx.bmo.cron;

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
import net.nanopay.tx.bmo.BmoFileProcessor;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.bmo.eftfile.BmoEftFile;
import net.nanopay.tx.cico.EFTFileStatus;


public class BmoSendFileCron implements ContextAgent {

  protected Logger logger;

  @Override
  public void execute(X x) {

    /**
     * GET and send generated files
     */
    DAO eftFileDAO = (DAO) x.get("bmoEftFileDAO");
    logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));

    ArraySink sink = (ArraySink) eftFileDAO.where(
      MLang.OR(
        MLang.EQ(BmoEftFile.STATUS, EFTFileStatus.GENERATED),
        MLang.EQ(BmoEftFile.STATUS, EFTFileStatus.FAILED)
      )
    ).select(new ArraySink());
    List<BmoEftFile> files = (ArrayList<BmoEftFile>) sink.getArray();

    for ( BmoEftFile file : files ) {
      /* Send and verify file */
      try{
        new BmoFileProcessor(x).sendAndVerify(file);
      } catch ( Exception e ) {
        logger.error("BMO send file failed. " + e.getMessage(), e);
        ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
          .setName("BMO send file")
          .setReason(AlarmReason.TIMEOUT)
          .setNote(e.getMessage())
          .build());
        BmoFormatUtil.sendEmail(x, "BMO EFT Error sending and verifying EFT File. " + e.getMessage(), e);
      }
    }
  }
}
