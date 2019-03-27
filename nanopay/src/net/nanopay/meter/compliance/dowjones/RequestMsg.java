package net.nanopay.meter.compliance.dowjones;

import foam.core.*;
import net.nanopay.meter.compliance.dowjones.model.*;
import foam.lib.xml.Outputter;

public class RequestMsg
  extends Msg
{
  private static Outputter xmlOutputter = new Outputter();
  private String requestInfo_;
  private String httpMethod_;
  private boolean isXmlSet_ = false;

  public RequestMsg() {
    this(null);
  }

  public RequestMsg(X x) {
    this(x, null);
  }

  public RequestMsg(X x, DowJonesCall model) {
    setX(x);
    setModel(model);
  }

  @Override
  public String getXml() {
    if ( isXmlSet_ == true ) {
      return xml_;
    } else {
      if ( model_ == null ) throw new RuntimeException("No model found");
      String ret = xmlOutputter.stringify(model_);
      setXml(ret);
      return ret;
    }
  }

  @Override
  public void setXml(String xml) {
    xml_ = xml;
    isXmlSet_ = true;
  }

  @Override
  public void setModel(DowJonesCall model) {
    model_ = model;
    isXmlSet_ = false;
  }

  @Override
  public DowJonesCall getModel() {
    return model_;
  }

  public void setRequestInfo(String requestInfo) {
    requestInfo_ = requestInfo;
  }

  public String getRequestInfo() {
    return requestInfo_;
  }

  public void setHttpMethod(String httpMethod) {
    httpMethod_ = httpMethod;
  }

  public String getHttpMethod() {
    return httpMethod_;
  }
}
