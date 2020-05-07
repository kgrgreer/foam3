package net.nanopay.tx.gs;

import foam.blob.Blob;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Count;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

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
