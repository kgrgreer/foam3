package net.nanopay.tx.alterna;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.logger.Logger;
import net.nanopay.cico.model.EFTConfirmationFileRecord;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * This class parse the EFT confirmation file
 */

public class EFTConfirmationFileParser extends EFTFileParser
{
  public List<FObject> parse(InputStream is) {

    X x = getX();
    Logger logger = (Logger) x.get("logger");
    List<FObject> ret = new ArrayList<>();
    BufferedReader reader = null;

    try {
      ClassInfo classInfo = EFTConfirmationFileRecord.getOwnClassInfo();
      List<Object> propertyInfos = new ArrayList<>();
      propertyInfos.add(classInfo.getAxiomByName("lineNumber"));
      propertyInfos.add(classInfo.getAxiomByName("status"));
      propertyInfos.add(classInfo.getAxiomByName("EFTTransactionId"));
      propertyInfos.add(classInfo.getAxiomByName("reason"));
      propertyInfos.add(classInfo.getAxiomByName("PADType"));
      propertyInfos.add(classInfo.getAxiomByName("transactionCode"));
      propertyInfos.add(classInfo.getAxiomByName("firstName"));
      propertyInfos.add(classInfo.getAxiomByName("lastName"));
      propertyInfos.add(classInfo.getAxiomByName("referenceId"));

      reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      parseFile(ret, reader, classInfo, propertyInfos);

    } catch ( IllegalAccessException | IOException | InstantiationException e ) {
      logger.error(e);
    } finally {
      IOUtils.closeQuietly(reader);
    }

    return ret;
  }
}
