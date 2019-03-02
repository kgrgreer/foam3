package net.nanopay.iso8583;

import foam.core.X;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import net.nanopay.iso8583.packager.ISO87Packager;
import net.nanopay.iso8583.packager.ISO93Packager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.PushbackInputStream;

public class ISO8583WebAgent
  implements foam.nanos.http.WebAgent
{
  protected static ThreadLocal<Outputter> outputter_ = ThreadLocal.withInitial(() -> new Outputter(OutputterMode.NETWORK));

  @Override
  public void execute(X x) {
    HttpServletRequest   req = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    PrintWriter out = x.get(PrintWriter.class);

    ISOMessage message;
    try ( PushbackInputStream in = new PushbackInputStream(req.getInputStream()) ) {
      // read and push back the version number
      int version = in.read();
      in.unread(version);

      // build the iso message with correct packager
      message = new ISOMessage.Builder(x)
        .setPackager(getMessagePackager((char) version))
        .build();

      // unpack iso message
      message.unpack(in);
    } catch ( Throwable t ) {
      outputException(resp, out, new ISO8583Exception.Builder(x)
        .setCode(HttpServletResponse.SC_INTERNAL_SERVER_ERROR)
        .setMessage(t.getMessage()).build());
      return;
    }

    // output iso 8583 message in JSON format
    out.println(outputter_.get().stringify(message));
  }

  /**
   * Helper function to return the correct packager
   *
   * @param version the version character
   * @return the ISOPackager for the correct version
   */
  protected ISOPackager getMessagePackager(char version) {
    switch ( version ) {
      case '0':
        return new ISO87Packager();
      case '1':
        return new ISO93Packager();
      default:
        throw new UnsupportedOperationException("Only ISO 8583:87 and ISO8583:93 are supported at this time");
    }
  }

  /**
   * Helper function to output exception
   *
   * @param resp HttpServletResponse to write status code to
   * @param out PrintWriter to write to
   * @param exception ISO8583Exception to output
   */
  protected void outputException(HttpServletResponse resp, PrintWriter out, ISO8583Exception exception) {
    resp.setStatus(exception.getCode());
    out.println(outputter_.get().stringify(exception));
  }
}
