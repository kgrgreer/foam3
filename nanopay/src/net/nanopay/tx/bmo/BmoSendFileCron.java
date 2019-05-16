package net.nanopay.tx.bmo;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.model.Transaction;

import java.util.ArrayList;


public class BmoSendFileCron implements ContextAgent {

  @Override
  public void execute(X x) {

    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.OR(
      MLang.INSTANCE_OF(AlternaCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(AlternaCOTransaction.getOwnClassInfo())
    );

    ArraySink sink = (ArraySink) transactionDAO.where(MLang.OR(
      MLang.INSTANCE_OF(AlternaCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(AlternaCOTransaction.getOwnClassInfo())
    )).select(new ArraySink());

    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    new BmoEftFileGenerator().init(x).createEftFile(transactions);
  }

}
