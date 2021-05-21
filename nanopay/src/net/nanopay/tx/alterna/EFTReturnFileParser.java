package net.nanopay.tx.alterna;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import net.nanopay.cico.model.EFTReturnRecord;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * This class parse the EFT response file
 */

public class EFTReturnFileParser extends EFTFileParser
{
  public List<FObject> parse(InputStream is) {

    X x = getX();
    Logger logger = (Logger) x.get("logger");
    List<FObject> ret = new ArrayList<>();
    ClassInfo classInfo = EFTReturnRecord.getOwnClassInfo();
    List<Object> propertyInfos = new ArrayList<>();
    propertyInfos.add(classInfo.getAxiomByName("transactionID"));
    propertyInfos.add(classInfo.getAxiomByName("externalReference"));
    propertyInfos.add(classInfo.getAxiomByName("returnCode"));
    propertyInfos.add(classInfo.getAxiomByName("returnDate"));
    propertyInfos.add(classInfo.getAxiomByName("amount"));
    propertyInfos.add(classInfo.getAxiomByName("type"));
    propertyInfos.add(classInfo.getAxiomByName("firstName"));
    propertyInfos.add(classInfo.getAxiomByName("lastName"));
    propertyInfos.add(classInfo.getAxiomByName("account"));
    propertyInfos.add(classInfo.getAxiomByName("bankNumber"));
    propertyInfos.add(classInfo.getAxiomByName("transitNumber"));

    try(BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
      parseFile(ret, reader, classInfo, propertyInfos);
    } catch ( IllegalAccessException | IOException | InstantiationException e ) {
      logger.error(e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("EFF File Parser")
        .setReason(AlarmReason.CREDENTIALS)
        .setNote(e.getMessage())
        .build());
    }

    return ret;
  }
}
