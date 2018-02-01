package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
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

    Sink sink = new ListSink();
    sink = transactionDAO_.select(sink);
    transactions_ = ((ListSink) sink).getData();
  }

  @Override
  public void execute(X x) {
    try {
      // sign using algorithm and private key
      int n = (int) (Math.random() * transactions_.size());
      ((Transaction) transactions_.get(n)).sign(sigAlgo_, keypair_.getPrivate());
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}