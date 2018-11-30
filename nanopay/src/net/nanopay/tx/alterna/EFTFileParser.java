package net.nanopay.tx.alterna;

import foam.core.ClassInfo;
import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.parse.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;

public abstract class EFTFileParser extends ContextAwareSupport
{
  public void parseFile(List<FObject> ret, BufferedReader reader, ClassInfo classInfo, List<Object> propertyInfos)
    throws IOException, InstantiationException, IllegalAccessException {

    String line;
    Object[] values;
    while ( (line = reader.readLine()) != null && line.length() > 0 ) {
      StringPStream ps = new StringPStream();
      if (line.charAt(line.length() - 1) == '|') {
        line += " ";
      }

      ps.setString(line);

      FObject obj = (FObject) classInfo.getObjClass().newInstance();
      Parser parser = new Repeat(new net.nanopay.tx.alterna.EFTStringParser(), new Literal("|"));
      PStream ps1 = ps.apply(parser, null);
      if ( ps1 == null ) throw new RuntimeException("format error");

      values = (Object[]) ps1.value();

      if (values.length == propertyInfos.size()) {
        for ( int i = 0; i < propertyInfos.size(); i++ ) {
          ((PropertyInfo)propertyInfos.get(i)).set(obj, ((PropertyInfo)propertyInfos.get(i)).fromString((String) values[i]));
        }
      }

      ret.add(obj);
    }
  }
}
