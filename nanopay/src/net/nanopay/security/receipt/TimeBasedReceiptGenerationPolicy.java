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
    schedule(interval);
  }

  public long getInterval() {
    return interval_;
  }

  private void schedule(long interval) {
    // don't run if interval is less than 0
    if ( interval <= 0 ) {
      return;
    }

    interval_ = interval;
    if ( scheduled_ != null ) {
      // cancel previous scheduled generation
      scheduled_.cancel(false);
    }

    scheduled_ = executor_.scheduleAtFixedRate(new Runnable() {
      @Override
      public void run() {
        getReceiptGenerator().generate();
      }
    }, interval_, interval_, java.util.concurrent.TimeUnit.MILLISECONDS);
  }
}
