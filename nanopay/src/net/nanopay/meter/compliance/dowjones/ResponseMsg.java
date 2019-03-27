package net.nanopay.meter.compliance.dowjones;

import foam.core.*;
import net.nanopay.meter.compliance.dowjones.model.*;
import java.io.Reader;
import java.io.StringReader;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

public class ResponseMsg
  extends Msg
{
  private int httpStatusCode_;
  private XMLSupport xmlSupport_;
  private XMLStreamReader xmlReader_;
  private boolean isModelSet_ = false;

  public ResponseMsg() {
    this(null);
  }

  public ResponseMsg(X x) {
    this(x, null);
  }

  public ResponseMsg(X x, String xml) {
    setXml(xml);
    setX(x);
    xmlSupport_ = new XMLSupport();
  }

  public void setHttpStatusCode(int httpStatusCode) {
    httpStatusCode_ = httpStatusCode;
  }
  public int getHttpStatusCode() {
    return httpStatusCode_;
  }

  @Override
  public void setModel(DowJonesCall model) {
    isModelSet_ = true;
    model_ = model;
  }

  @Override
  public DowJonesCall getModel() {
    if ( isModelSet_ == true ) {
      return model_;
    } else {
      if ( getX() == null ) {
        throw new RuntimeException("No Context Found");
      }
      if ( modelInfo_ == null ) {
        throw new RuntimeException("No Model ClassInfo Found");
      }
      if ( getXml() == null ) {
        throw new RuntimeException("No XML Found");
      }
      FObject obj = null;

      try {
        Reader reader = new StringReader(getXml());
        XMLInputFactory factory = XMLInputFactory.newInstance();
        xmlReader_ = factory.createXMLStreamReader(reader);
      } catch ( XMLStreamException e ) {
        throw new RuntimeException("Could not read from file with existing XMLStreamReader");
      }
      
      obj = xmlSupport_.createObj(getX(), xmlReader_, modelInfo_.getObjClass());
      if ( obj == null ) {
        throw new RuntimeException("XML Parser Error: " + getXml());
      }
      setModel((DowJonesCall) obj);
      return (DowJonesCall) obj;
    }
  }

  @Override
  public void setXml(String xml) {
    xml_ = xml;
    isModelSet_ = false;
  }
}
