package net.nanopay.cico.service;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;

import java.io.PrintWriter;

public class CICOTransactionWebAgent
    implements WebAgent
{
  public CICOTransactionWebAgent() {}

  public void execute(X x) {
    PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    Sink outputter = new Outputter(out, OutputterMode.STORAGE, false);
    // TODO: figure out where clause
    outputter = transactionDAO.select(outputter);
  }
}