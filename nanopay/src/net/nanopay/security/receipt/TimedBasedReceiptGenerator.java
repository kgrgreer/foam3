package net.nanopay.security.receipt;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import net.nanopay.security.MerkleTree;

import java.security.MessageDigest;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class TimedBasedReceiptGenerator
  extends ContextAwareSupport
  implements ReceiptGenerator
{
  protected byte[][] tree_;
  protected final long interval_;
  protected final String algorithm_;
  protected final MerkleTree builder_;

  protected final AtomicInteger count_ = new AtomicInteger(0);
  protected final AtomicBoolean generated_ = new AtomicBoolean(false);
  protected final ThreadLocal<MessageDigest> md_ = new ThreadLocal<MessageDigest>() {
      @Override
      protected MessageDigest initialValue() {
        try {
          return MessageDigest.getInstance(algorithm_);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      }

      @Override
      public MessageDigest get() {
        MessageDigest md = super.get();
        md.reset();
        return md;
      }
    };

  public TimedBasedReceiptGenerator(X x) {
    this(x, "SHA-256", 20);
  }

  public TimedBasedReceiptGenerator(X x, String algorithm) {
    this(x, algorithm, 20);
  }

  public TimedBasedReceiptGenerator(X x, long interval) {
    this(x, "SHA-256", interval);
  }

  public TimedBasedReceiptGenerator(X x, String algorithm, long interval) {
    setX(x);
    interval_ = interval;
    algorithm_ = algorithm;
    builder_ = new MerkleTree(algorithm);
  }

  @Override
  public void add(FObject obj) {
    try {
      synchronized (generated_) {
        while (generated_.get()) {
          generated_.wait();
        }

        builder_.addHash(obj.hash(md_.get()));
        count_.incrementAndGet();
      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void build() {
    synchronized ( generated_ ) {
      if ( tree_ == null && count_.get() != 0 ) {
        tree_ = builder_.buildTree();
        generated_.set(true);
        generated_.notifyAll();
      }
    }
  }

  @Override
  public Receipt generate(FObject obj) {
    try {
      synchronized ( generated_ ) {
        while (!generated_.get()) {
          generated_.wait();
        }

        Receipt receipt = net.nanopay.security.MerkleTreeHelper.SetPath(tree_, obj.hash(md_.get()),
          new net.nanopay.security.receipt.Receipt.Builder(getX()).setData(obj).build());

        if ( count_.decrementAndGet() == 0 ) {
          tree_ = null;
          generated_.set(false);
          generated_.notifyAll();
        }

        return receipt;
      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void start() throws Exception {
    Executors.newScheduledThreadPool(16).scheduleAtFixedRate(new Runnable() {
      @Override
      public void run() {
        TimedBasedReceiptGenerator.this.build();
      }
    }, 10 * 1000, interval_, TimeUnit.MILLISECONDS);
  }
}
