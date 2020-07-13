package net.nanopay.tx.gs;

import foam.blob.Blob;
import foam.blob.InputStreamBlob;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.nanos.ruler.Rule;
import net.nanopay.liquidity.tx.BusinessRule;
import net.nanopay.tx.ruler.TransactionLimitRule;
import foam.dao.DAO;
import foam.mlang.sink.Count;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.List;

import static foam.mlang.MLang.INSTANCE_OF;
import static foam.mlang.MLang.OR;

public class IngestionTest
  extends foam.nanos.test.Test {


  public void runTest(X x){
    String name = "9differentTxnTypes.csv";
    int timeOut = 15;
    int expectedTxns = 26;

    GsRowToTx ingestionScript = new GsRowToTx();
    java.io.File file = new java.io.File("deployment/liquid/"+name);
    FileInputStream in = null;
    DAO txdao = (DAO) x.get("localTransactionDAO");
    Count c1 = (Count) txdao.select(new Count());
    try {
      in = new FileInputStream(file);
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    }
    DAO ruleDAO = (DAO) x.get("ruleDAO");
    List limits = ((ArraySink) ruleDAO.where(OR(INSTANCE_OF(TransactionLimitRule.class),INSTANCE_OF(BusinessRule.class) )).select(new ArraySink())).getArray();
    for (Object r : limits){
      ((Rule) r).setEnabled(false);
      ruleDAO.put((FObject) r);
    }
    Blob data = new InputStreamBlob(in, file.length());


    ingestionScript.process(x,data,"ingestionTest",name);
    DAO pbdDAO = (DAO) x.get("ProgressBarDAO");
    try {
      Thread.sleep(100);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    ProgressBarData pbd = (ProgressBarData) pbdDAO.find("ingestionTest");
    int counter = 0;
    while ( pbd.getValue() < pbd.getMaxValue() && counter < (timeOut*10) ) {
      try {
        Thread.sleep(100);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      pbd = (ProgressBarData) pbdDAO.find("ingestionTest");
      counter++;
    }

    test( pbd.getStatus().equals("File upload complete"), "File ingestion status is: "+pbd.getStatus());
    test( counter < 30 , "File ingestion took "+ (counter/10)+ " seconds to complete, time out is: "+timeOut+" seconds");
    test( pbd.getReport() != null, "Ingestion Report is available: "+pbd.getReport());
    Count c2 = (Count) txdao.select(new Count());
    test( (c2.getValue() - c1.getValue()) == expectedTxns, "Number of transactions created: "+(c2.getValue() - c1.getValue())+ " when "+ expectedTxns+" transactions were expected");
  }
}
