package net.nanopay.cico.spi.alterna;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.parse.*;
import net.nanopay.cico.model.EFTReturnRecord;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * This class parse the EFT response file
 */

public class EFTReturnFileParser
{
  public List<FObject> parse(InputStream is) {

    try {
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

      BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      String line;
      Object[] values;

      while ((line = reader.readLine()) != null) {
        StringPStream ps = new StringPStream();
        ps.setString(line);

        FObject obj = (FObject) classInfo.getObjClass().newInstance();
        Parser parser = new Repeat(new EFTStringParser(), new Literal("|"));
        PStream ps1 = ps.apply(parser, null);
        if (ps1 == null) throw new RuntimeException("format error");

        values = (Object[]) ps1.value();
        for (int i = 0; i < propertyInfos.size(); i++) {
          ((PropertyInfo)propertyInfos.get(i)).set(obj, ((PropertyInfo)propertyInfos.get(i)).fromString((String) values[i]));
        }
        ret.add(obj);
      }

      reader.close();
      return ret;
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }
}