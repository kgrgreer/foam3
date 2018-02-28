package net.nanopay.cico.spi.alterna;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.spi.alterna.CsvUtil;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.model.Branch;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class AlternaWebAgent
    implements WebAgent
{
  public AlternaWebAgent() {}

  public synchronized void execute(X x) {

    PrintWriter  out = (PrintWriter) x.get(PrintWriter.class);

    HttpServletResponse response = (HttpServletResponse) x.get(HttpServletResponse.class);

    CsvUtil util = new CsvUtil();

    final Date now = new Date();
    response.setContentType("text/csv");
    response.setHeader("Content-disposition", "attachment; filename=\"" + util.generateFilename(now) + "\"");

    final Sink outputter = util.writeCsvFile(x, OutputterMode.STORAGE, null, out, false);

  }
}