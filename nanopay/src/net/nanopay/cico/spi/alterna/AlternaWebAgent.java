package net.nanopay.cico.spi.alterna;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AlternaWebAgent
    implements WebAgent
{
  protected ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  public AlternaWebAgent() {}

  public String generateReferenceId() {
    return new Date().getTime() + "" + Math.floor(Math.random() * (99999 - 10000) + 10000);
  }

  public synchronized void execute(X x) {
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    PrintWriter  out = (PrintWriter) x.get(PrintWriter.class);
    final Sink outputter = new Outputter(out, OutputterMode.STORAGE, false);
    HttpServletResponse response = (HttpServletResponse) x.get(HttpServletResponse.class);

    response.setContentType("text/html");
    response.setHeader("Content-disposition", "attachment; filename=\"mintchipcashout_" + sdf.get().format(new Date()) + ".csv\"");

    transactionDAO.select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        Transaction t = (Transaction) obj;
        AlternaFormat alternaFormat = new AlternaFormat();
        alternaFormat.setReference(generateReferenceId());
        outputter.put(alternaFormat, sub);
      }
    });
  }
}