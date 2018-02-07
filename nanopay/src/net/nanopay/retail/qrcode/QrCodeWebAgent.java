package net.nanopay.retail.qrcode;

import foam.core.X;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;
import net.nanopay.retail.qrcode.QrCode;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.Writer;

public class QrCodeWebAgent
    implements WebAgent
{

  @Override
  public void execute(X x) {
    HttpServletRequest req = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    Transaction transaction = new Transaction.Builder(x)
        .setPayeeId(1000)
        .setPayerId(1001)
        .setPayeeName("Payee 1")
        .setPayerName("Payer 2")
        .build();

    Outputter outputter = new Outputter(OutputterMode.STORAGE);
    QrCode qr = QrCode.encodeText(outputter.stringify(transaction), QrCode.Ecc.MEDIUM);

    try {
      Writer writer = resp.getWriter();
      writer.write(qr.toSvgString(4));
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}