package net.nanopay.sps.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.csv.CSVSupport;
import foam.nanos.logger.Logger;
import net.nanopay.sps.SPSConfig;
import net.nanopay.sps.SPSRejectFileRecord;
import net.nanopay.sps.SPSTransaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class SPSRejectFileProcessor implements ContextAgent {
  @Override
  public void execute(X x) {
    SPSConfig spsConfig = (SPSConfig) x.get("SPSConfig");

    CSVSupport csvSupport = new CSVSupport();
    csvSupport.setX(x);

    File file = new File("/Users/zaczhang/Downloads/chargeback180814.txt");
    String input = editFirstRow(x, file);
    InputStream is = new ByteArrayInputStream(input.getBytes());

    ArraySink arraySink = new ArraySink();
    csvSupport.inputCSV(is, arraySink, SPSRejectFileRecord.getOwnClassInfo());

    List list = arraySink.getArray();
    for ( Object record : list ) {
      SPSRejectFileRecord spsRejectFileRecord = (SPSRejectFileRecord) record;
      processTransaction(x, spsRejectFileRecord);
    }
  }

  public static void processTransaction(X x, SPSRejectFileRecord spsRejectFileRecord) {
    DAO transactionDao = (DAO)x.get("localTransactionDAO");
    SPSTransaction tran = (SPSTransaction) transactionDao.find(AND(
      EQ(SPSTransaction.BATCH_ID, spsRejectFileRecord.getBatch_ID()),
      EQ(SPSTransaction.ITEM_ID, spsRejectFileRecord.getItem_ID())
    ));

    if ( tran != null ) {
      tran = (SPSTransaction) tran.fclone();
      tran.setStatus(TransactionStatus.DECLINED);
      tran.setRejectReason(spsRejectFileRecord.getReason());
      tran.setChargebackTime(spsRejectFileRecord.getChargeBack());

      transactionDao.put(tran);
    }
  }

  private String editFirstRow(X x, File file) {
    String line;
    StringBuilder sb = new StringBuilder();
    BufferedReader br = null;
    Logger logger = (Logger) x.get("logger");

    try {
      InputStream is = FileUtils.openInputStream(file);
      br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));

      if ( (line = br.readLine()) != null ) {
        line = line.replaceAll(" ", "_").replaceAll("/", "_");
        sb.append(line).append("\n");
      }

      while ( (line = br.readLine()) != null ) {
        sb.append(line).append("\n");
      }

    } catch (IOException e) {
      logger.error(e);
    } finally {
      if ( br != null ) {
        try {
          br.close();
        } catch (IOException e) {
          logger.error(e);
        }
      }
    }

    return sb.toString();
  }
}
