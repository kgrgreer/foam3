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
import net.nanopay.cico.spi.alterna.AlternaFormat;

import java.io.PrintWriter;

public class AlternaWebAgent
    implements WebAgent
{
  public AlternaWebAgent() {}

  public void execute(X x) {
    PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    final Sink outputter = new Outputter(out, OutputterMode.STORAGE, false);

    transactionDAO.select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        AlternaFormat alternaFormat = new AlternaFormat();
        outputter.put(alternaFormat, sub);
      }
    });
  }
}