package net.nanopay.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

import java.security.PrivateKey;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class SignatureVerificationBenchmark
    extends SignatureBenchmark
{
  protected DAO transactionDAO_;
  protected List<SimpleEntry<Transaction, byte[]>> transactions_ = new ArrayList<>();

  public SignatureVerificationBenchmark(String keypairAlgorithm, String hashingAlgorithm) {
    super(keypairAlgorithm, hashingAlgorithm);
  }

  @Override
  public void setup(X x) {
    PrivateKey key = keypair_.getPrivate();
    transactionDAO_ = (DAO) x.get("localTransactionDAO");

    Sink sink = new ListSink();
    sink = transactionDAO_.select(sink);
    List data = ((ListSink) sink).getData();
    Iterator i = data.iterator();
    while ( i.hasNext() ) {
      Transaction t = (Transaction) i.next();
      transactions_.add(new SimpleEntry<>(t, t.sign(sigAlgo_, key)));
    }
  }

  @Override
  public void execute(X x) {
    try {
      int n = (int) (Math.random() * transactions_.size());
      SimpleEntry<Transaction, byte[]> entry = transactions_.get(n);
      entry.getKey().verify(entry.getValue(), sigAlgo_, keypair_.getPublic());
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}