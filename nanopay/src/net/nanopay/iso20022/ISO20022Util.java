/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.iso20022;

import foam.core.*;
import foam.lib.xml.Outputter;
import foam.nanos.logger.Logger;

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
    xmlOutputter.output("<Document ");
    xmlOutputter.output("xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.002.001.03\"");
    xmlOutputter.output("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">");
    xmlOutputter.output(obj);
    xmlOutputter.output("</Document>");
    String xml = xmlOutputter.toString();
    xml = xml.replaceFirst("<" + obj.getClass().getSimpleName() + ">","");
    xml = replaceLast(xml, "", "</" + obj.getClass().getSimpleName() + ">");
    return xml;
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