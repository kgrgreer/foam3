package net.nanopay.security.receipt;

public class TimeBasedReceiptGenerationPolicy
  extends net.nanopay.security.receipt.AbstractReceiptGenerationPolicy
{
  protected long interval_ = 0;
  protected java.util.concurrent.ScheduledExecutorService executor_ =
    java.util.concurrent.Executors.newScheduledThreadPool(16);
  protected java.util.concurrent.ScheduledFuture scheduled_ = null;


  public TimeBasedReceiptGenerationPolicy(foam.core.X x, ReceiptGenerator generator) {
    this(x, 20, generator);
  }

  public TimeBasedReceiptGenerationPolicy(foam.core.X x, long interval, ReceiptGenerator generator) {
    setX(x);
    setReceiptGenerator(generator);
  }

  public long getInterval() {
    return interval_;
  }

  public void setInterval(long interval) {
    interval_ = interval;
  }

  public boolean schedule() {
    if (interval_ <= 0) {
      return false;
    }

    if ( scheduled_ != null ) {
      // cancel previous scheduled generation
      scheduled_.cancel(false);
    }

    scheduled_ = executor_.scheduleAtFixedRate(new Runnable() {
      @Override
      public void run() {
        getReceiptGenerator().build();
      }
    }, interval_, interval_, java.util.concurrent.TimeUnit.MILLISECONDS);
    return true;
  }
}
