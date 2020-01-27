package net.nanopay.retail;

import foam.core.X;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import io.nayuki.qrcodegen.QrCode;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.PrintWriter;

public class QrCodeWebAgent
    implements WebAgent
{
  public static final int BUFFER_SIZE = 4096;

  protected static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  @Override
  public void execute(X x) {
    try {
      HttpServletRequest req = x.get(HttpServletRequest.class);
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      PrintWriter writer = resp.getWriter();
      BufferedReader reader = req.getReader();

      int read = 0;
      int count = 0;
      int length = req.getContentLength();

      StringBuilder builder = sb.get();
      char[] cbuffer = new char[BUFFER_SIZE];
      while ( (read = reader.read(cbuffer, 0, BUFFER_SIZE)) != -1 && count < length ) {
        builder.append(cbuffer, 0, read);
        count += read;
      }

      QrCode qr = QrCode.encodeText(builder.toString(), QrCode.Ecc.MEDIUM);
      writer.write(qr.toSvgString(4));
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
    }
  }
}
