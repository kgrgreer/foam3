package net.nanopay.meter.compliance.dowJones;

import foam.core.*;
import net.nanopay.meter.compliance.dowJones.model.*;

public abstract class DowJonesMsg
  extends ContextAwareSupport
{
  protected String xml_;
  protected DowJonesCall model_;
  protected ClassInfo modelInfo_;

  public void setXml(String xml) {
    xml_ = xml;
  }
  public String getXml() {
    return xml_;
  }
  public void setModelInfo(ClassInfo modelInfo) {
    modelInfo_ = modelInfo;
  }
  public ClassInfo getModelInfo() {
    return modelInfo_;
  }
  public void setModel(DowJonesCall model) {
    model_ = model;
  }
  public DowJonesCall getModel() {
    return model_;
  }
}