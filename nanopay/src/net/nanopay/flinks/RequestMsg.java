package net.nanopay.flinks;

import foam.core.*;
import net.nanopay.flinks.model.*;
import foam.lib.PermissionedPropertyPredicate;
import foam.lib.json.Outputter;

public class RequestMsg 
  extends Msg
{
  private Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new PermissionedPropertyPredicate());
  private String requestInfo_;
  private String httpMethod_;
  private boolean isJsonSet_ = false;

  public RequestMsg() {
    this(null);
  }
  public RequestMsg(X x) {
    this(x, null);
  }
  public RequestMsg(X x, FlinksCall model){
    setX(x);
    setModel(model);
  }

  @Override
  public String getJson() {
    if ( isJsonSet_ == true) {
      return json_;
    } else {
      if ( model_ == null ) throw new RuntimeException("No model found");
      String ret = jsonOutputter.stringify(model_);
      setJson(ret);
      return ret;
    }
  }

  @Override
  public void setJson(String json) {
    json_ = json;
    isJsonSet_ = true;
  }

  @Override
  public void setModel(FlinksCall model) {
    model_ = model;
    isJsonSet_ = false;
  }

  @Override
  public FlinksCall getModel() {
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
