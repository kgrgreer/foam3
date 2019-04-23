package net.nanopay.kotak;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.lib.json.OutputterMode;
import foam.lib.xml.Outputter;

import java.text.SimpleDateFormat;
import java.util.Date;

public class KotakXMLOutputter extends Outputter {

  KotakXMLOutputter(OutputterMode mode) {
    super(mode);
    super.outputDefaultValues_ = true;
  }

  @Override
  protected void outputFObject(FObject obj) {
    if ( "Payment".equals(obj.getClass().getSimpleName()) ) {
      writer_.append("<").append(obj.getClass().getSimpleName())
        .append(" xmlns=\"http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd\">");
    } else if ( "Reversal".equals(obj.getClass().getSimpleName()) ) {
      writer_.append("<").append(obj.getClass().getSimpleName())
        .append(" xmlns=\"http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd\">");
    } else {
      writer_.append("<").append(obj.getClass().getSimpleName()).append(">");
    }

    outputProperties_(obj);
    writer_.append("</").append(obj.getClass().getSimpleName()).append(">");
  }

  @Override
  protected void outputPrimitiveProperty(Object value, PropertyInfo prop) {
    if (value == "") {
      writer_.append("<").append(getPropertyName(prop)).append(" />");
      return;
    }

    writer_.append("<").append(getPropertyName(prop)).append(">");
    prop.toXML(this, value);
    writer_.append("</").append(getPropertyName(prop)).append(">");
  }

  @Override
  protected void outputDate(Date value) {
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    writer_.append(sdf.format(value));
  }
}
