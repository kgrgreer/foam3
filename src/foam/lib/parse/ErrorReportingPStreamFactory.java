/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 package foam.lib.parse;

import java.util.*;

import foam.core.X;
import foam.core.XFactory;

public class ErrorReportingPStreamFactory implements XFactory {
  private final ErrorReportingPStream eps;
  private X                           x;
  private String                      fileName;
  public static final List<String>    listErps_ = new ArrayList<>();

  public ErrorReportingPStreamFactory(ErrorReportingPStream ErrorRps, String fileName) {
    this.eps      = ErrorRps;
    this.fileName = fileName;
  }

  @Override
  public Object create(X x) {
    this.x = x;
    return null;
  }

  public CharSequence getMessage() {
    String msg = eps.getMessage();
    listErps_.add(fileName + ";" + msg);
    x.put("epsJrl", listErps_);
    return msg;
  }

  public PStream apply(Parser parser, ParserContext x) {
    return eps.apply(parser, x);
  }

  public static List<String> getListErps() {
    return listErps_;
  }

  public void EmptyListErps() {
    listErps_.removeAll(listErps_);
  }
}
