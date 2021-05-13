package net.nanopay.tx.rbc.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.log.LogLevel;
import foam.mlang.MLang;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import net.nanopay.tx.rbc.RbcFileProcessor;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import static foam.mlang.MLang.*;


public class RbcSendFileCron implements ContextAgent {

  protected Logger logger;

  @Override
  public void execute(X x) {

    /**
     * GET and send generated files
     */
      String alarmName = "RbcSendFileCron-Status";
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      try {
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
            Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, alarmName));
            if ( alarm != null && alarm.getIsActive() ) {
              alarm.setIsActive(false);
              alarmDAO.put(alarm);
            }
          } catch ( Exception e ) {
            Alarm alarm = new Alarm.Builder(x)
              .setName(alarmName)
              .setReason(AlarmReason.TIMEOUT)
              .setNote("RbcSendFileCron send file failed Exception: " + e.getMessage())
              .setSeverity(LogLevel.ERROR)
              .build();
            alarmDAO.put(alarm);
            logger.error(alarmName, e);
          }
        }
      } catch ( Exception e ) {
        String note = "RbcSendFileCron Exception: " + e.getMessage();
        Alarm alarm = new Alarm(alarmName, note, LogLevel.ERROR);
        alarmDAO.put(alarm);
        logger.error(alarmName, e);
      }
  }
}
