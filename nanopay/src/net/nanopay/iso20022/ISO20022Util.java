/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.iso20022;

import foam.core.*;
import foam.lib.xml.Outputter;
import foam.nanos.logger.Logger;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamException;
import javax.xml.bind.DatatypeConverter;


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

  public Object fromString(String value) {
    System.out.println("inside fromString: " + value);
    StringPStream ps = new StringPStream(value);
    ParserContextImpl x = new ParserContextImpl();
    ps = (StringPStream) new ISODateParser().parse(ps, x);
    System.out.println("StringPStream: " + ps.value());
    return ps == null ? null : ps.value();
  }

  public Object dateFromXML(X x, XMLStreamReader reader) {
    try {
      reader.next();
      return DatatypeConverter.parseDateTime(reader.getText()).getTime();
    } catch (XMLStreamException ex) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Premature end of xml file while reading property");
    }
    return null;
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

  public Object arrayFromXML(X x, XMLStreamReader reader, Class defaultClass) {
    List objList = new ArrayList();
    FObject obj = null;
    String startTag = reader.getLocalName();
    System.out.println("startTag: " + startTag);
    PropertyInfo prop = null;

    try {

      if ( defaultClass == null ) return objList;

      defaultClass = defaultClass.getComponentType();
      obj = (FObject) x.create(defaultClass);
      Map<String, String> propMap = getObjectPropertyInfoMap(x, obj, null);
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            ClassInfo cInfo = obj.getClassInfo();

            prop = (PropertyInfo) cInfo.getAxiomByName(propMap.get(reader.getLocalName()));
            String val = prop == null ? " null " : " not null ";
            System.out.println("PropertyINfo is - " + val + " for " + reader.getLocalName());
            if ( prop != null ) {
              Class objClass = prop.getValueClass();
              System.out.println("objClass name: " + objClass.getName());

              if (Enum.class.isAssignableFrom(objClass)) {
                prop.set(obj, enumFromXML(x, reader, objClass));
              } else if (Date.class.isAssignableFrom(objClass)) {
                prop.set(obj, dateFromXML(x, reader));
              } else if (objClass.isArray()) {
                prop.set(obj, arrayFromXML(x, reader, objClass));
                System.out.println("back from : arrayFromXML");
              } else if ( FObject.class.isAssignableFrom(objClass) ) {
                prop.set(obj, createObj(x, reader, objClass));
              } else {
                prop.set(obj, prop.fromXML(x, reader));
              }
              
              prop = null;
            }
            break;
          case XMLStreamConstants.END_ELEMENT:
            if ( reader.getLocalName() == startTag ) { System.out.println("EndTag: " + startTag); objList.add(obj); return objList.toArray(); }
        }
      }
  }catch (XMLStreamException ex ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
    }

    objList.add(obj);
    return objList.toArray();
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
    }

    return obj;

  }

  public void setAttributeValue(X x, XMLStreamReader reader, FObject obj) {
    int attributes = reader.getAttributeCount();
    if (attributes > 0 ) {
      Map<String, String> propMap = getObjectPropertyInfoMap(x, obj, null);
      System.out.println("Attributes found " + attributes);
      for (int i = 0; i < attributes; i++ ) {
        String attrName = reader.getAttributeLocalName(i);
        String attrVal = reader.getAttributeValue(i);
        System.out.println("Attribute name " + attrName + " and value is " + attrVal + " for class " + obj.getClass().getSimpleName());
        PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(propMap.get(attrName));
        if ( prop != null ) {
          System.out.println("Attributes propertin is not null ");
          prop.set(obj, attrVal);
        }
      }

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

  public FObject copyFromXML(X x, XMLStreamReader reader, FObject obj) {
    Map<String, String> propMap = getObjectPropertyInfoMap(x, obj, null);
    String startTag = reader.getLocalName();
    System.out.println("Local Name: " + startTag);
    setAttributeValue(x, reader, obj);
    try {
      while ( reader.hasNext() ) {
        int eventType;
        eventType = reader.next();
        switch ( eventType ) {
          case XMLStreamConstants.START_ELEMENT:
            System.out.println("Local Name: " + reader.getLocalName());
            ClassInfo cInfo = obj.getClassInfo();

            PropertyInfo prop = (PropertyInfo) cInfo.getAxiomByName(propMap.get(reader.getLocalName()));
            String val = prop == null ? " null " : " not null ";
            System.out.println("PropertyINfo is - " + val + " for " + reader.getLocalName());
            if ( prop != null ) {
              Class objClass = prop.getValueClass();
              System.out.println("objClass name: " + objClass.getName());

              if (Enum.class.isAssignableFrom(objClass)) {
                prop.set(obj, enumFromXML(x, reader, objClass));
              } else if (Date.class.isAssignableFrom(objClass)) {
                prop.set(obj, dateFromXML(x, reader));
              } else if (objClass.isArray()) {
                prop.set(obj, arrayFromXML(x, reader, objClass));
                System.out.println("back from : arrayFromXML");
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
    }  
    return obj;  
  }

  public FObject createObj (X x, XMLStreamReader xmlr, Class defaultClass) {
    FObject obj = null;
    try {
      if ( defaultClass == null ) return null;

      obj = (FObject) x.create(defaultClass);
      System.out.println("obj was created for " + defaultClass.getName());
      obj = copyFromXML(x, xmlr, obj);
    } catch (Throwable t) {
      t.printStackTrace();
      Logger logger = (Logger) x.get("logger");
      logger.error("Error while reading file");
    }
    return obj;
  }

  public Map getObjectPropertyInfoMap(X x, FObject obj, Map propMap) {
    if ( propMap == null ) propMap = new HashMap<String, String>();
     
    List<PropertyInfo> props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo prop : props ) {
      // if ( prop.getXMLAttribute() ) continue;
      String name = prop.getName();
      String shortName = prop.getShortName() == null ? name : prop.getShortName();
      System.out.println("Shortname - " + shortName + " , Name - " + name);
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