package net.nanopay.meter.compliance.dowJones;

import foam.core.*;
import net.nanopay.meter.compliance.dowJones.model.*;
import org.w3c.dom.*;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import javax.xml.parsers.*;
import java.io.*;
import java.io.Reader;
import java.io.StringReader;

public class DowJonesResponseMsg
  extends DowJonesMsg
{
  private int httpStatusCode_;
  private XMLSupport xmlSupport_;
  private XMLStreamReader xmlReader_;
  private boolean isModelSet_ = false;

  public DowJonesResponseMsg() {
    this(null);
  }

  public DowJonesResponseMsg(X x) {
    this(x, null);
  }

  public DowJonesResponseMsg(X x, String xml) {
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
        JAXBContext jaxbContext = JAXBContext.newInstance(obj.getClass());
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        obj = jaxbUnmarshaller.unmarshal(new StringReader(getXml()));
      } catch ( JAXBException e ) {
        throw new RuntimeException("Could not parse xml string");
      }

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
