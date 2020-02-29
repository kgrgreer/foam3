package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.logger.Logger;
import net.nanopay.tx.model.Transaction;

import java.util.List;

public class SignatureGenerationBenchmark
    extends SignatureBenchmark
{
  protected List transactions_;
  protected DAO transactionDAO_;

  public SignatureGenerationBenchmark(String keypairAlgorithm, String hashingAlgorithm) {
    super(keypairAlgorithm, hashingAlgorithm);
  }

  @Override
  public void setup(X x) {
    transactionDAO_ = (DAO) x.get("localTransactionDAO");

    Sink sink = new ArraySink();
    sink = transactionDAO_.select(sink);
    transactions_ = ((ArraySink) sink).getArray();
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    try {
      // sign using algorithm and private key
      int n = (int) (Math.random() * transactions_.size());
      ((Transaction) transactions_.get(n)).sign(sigAlgo_, keypair_.getPrivate());
    } catch (Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
    }
  }
}
