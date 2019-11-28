/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.iso20022;

import foam.core.*;
import foam.lib.xml.Outputter;
import foam.nanos.logger.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamException;


public class ISO20022Util {

  private final boolean useShortName;

  public ISO20022Util(){
    this(true);
  }

  public ISO20022Util(boolean useShortName){
    this.useShortName = useShortName;
  }

  public String toXML(FObject obj) {
    Outputter xmlOutputter = new Outputter();
    xmlOutputter.setOutputShortNames(this.useShortName);

    xmlOutputter.output("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    xmlOutputter.output(obj);
    String xml = xmlOutputter.toString();
    xml = xml.replaceFirst(obj.getClass().getSimpleName(), "Document");
    xml = replaceLast(xml, "Document", obj.getClass().getSimpleName());
    return xml;
  }

  public FObject fromXML(X x, XMLStreamReader reader, Class defaultClass) {
    FObject obj = null;
    if ( defaultClass == null ) return null;
    try {
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            if ( reader.getLocalName().equals("Document") ) {
              obj = createObj(x, reader, defaultClass);
            }
            break;
        }
      }
    } catch (XMLStreamException ex ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    }
    return obj;
  }

  public FObject createObj (X x, XMLStreamReader xmlr, Class defaultClass) {
    FObject obj = null;
    try {
      if ( defaultClass == null ) return null;
      obj = copyFromXML(x, xmlr, (FObject) x.create(defaultClass));
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    }
    return obj;
  }

  public FObject copyFromXML(X x, XMLStreamReader reader, FObject obj) {
    Map<String, String> propMap = getObjectPropertyInfoMap(x, obj, null);
    String startTag = reader.getLocalName();
    setAttributeValue(x, reader, obj);
    try {
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            ClassInfo cInfo = obj.getClassInfo();
            PropertyInfo prop = (PropertyInfo) cInfo.getAxiomByName(propMap.get(reader.getLocalName()));
            if ( prop != null ) {
              Class objClass = prop.getValueClass();
              if (Enum.class.isAssignableFrom(objClass)) {
                prop.set(obj, enumFromXML(x, reader, objClass));
              } else if (objClass.isArray()) {
                prop.set(obj, arrayFromXML(x, reader, objClass));
              } else if ( FObject.class.isAssignableFrom(objClass) ) {
                prop.set(obj, createObj(x, reader, objClass));
              } else {
                prop.set(obj, prop.fromXML(x, reader));
              }
              prop = null;
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName().equals(startTag) ) {
              return obj;
            }
        }
      }
    } catch (XMLStreamException ex ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    }  
    return obj;  
  }

  public void setAttributeValue(X x, XMLStreamReader reader, FObject obj) {
    int attributes = reader.getAttributeCount();
    if (attributes > 0 ) {
      Map<String, String> propMap = getObjectPropertyInfoMap(x, obj, null);
      for (int i = 0; i < attributes; i++ ) {
        PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(
          propMap.get(reader.getAttributeLocalName(i)));
        if ( prop != null ) {
          prop.set(obj, reader.getAttributeValue(i));
        }
      }

      // dirty hack for objects that are just a textnode. This should be moved elsewhere?
      for ( Map.Entry<String, String> entry : propMap.entrySet() ) {
        PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(propMap.get(entry.getValue()));
        if ( prop.getXMLTextNode() ) {
          try{
            reader.next();
            prop.set(obj, reader.getText());
          } catch(XMLStreamException e) {
          }
        }
      }
    }
  }

  public Object arrayFromXML(X x, XMLStreamReader reader, Class defaultClass) {
    List objList = new ArrayList();
    if ( defaultClass == null ) return objList;
    defaultClass = defaultClass.getComponentType();
    FObject obj = copyFromXML(x, reader, (FObject) x.create(defaultClass));
    objList.add(obj);
    return objList.toArray();
  }

  public Object enumFromXML(X x, XMLStreamReader reader, Class defaultClass) {
    FObject obj = null;
    if ( defaultClass == null ) return obj;
    try {
      while ( reader.hasNext() ) {
        switch ( reader.getEventType() ) {
          case XMLStreamConstants.START_ELEMENT:
              reader.next();
              return Enum.valueOf(defaultClass, reader.getText());
          case XMLStreamConstants.END_ELEMENT:
            break;
        }
        reader.next();
      }
    } catch (XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of xml file while reading property");
    }
    return obj;
  }

  public Map getObjectPropertyInfoMap(X x, FObject obj, Map propMap) {
    if ( propMap == null ) propMap = new HashMap<String, String>();
    if ( obj == null ) return propMap;
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo prop : props ) {
      String name = prop.getName();
      String shortName = prop.getShortName() == null ? name : prop.getShortName();
      propMap.put(shortName, name);
    }
    return propMap;
  }
  
  public String replaceLast(String str, String replace, String find) {
    int lastIndex = str.lastIndexOf(find);
    if (lastIndex == -1) {
        return str;
    }
    String beginString = str.substring(0, lastIndex);
    String endString = str.substring(lastIndex + find.length());
    return beginString + replace + endString;
  }
}