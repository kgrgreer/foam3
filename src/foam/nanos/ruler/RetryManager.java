package foam.nanos.ruler;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.util.retry.RetryStrategy;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.CountDownLatch;

public class RetryManager {
  protected final RetryStrategy retryStrategy_;
  protected final String          description_;
  protected CountDownLatch        latch_;
  protected Exception             exception_;

  class Retry {
    final X            x_;
    final ContextAgent agent_;
    final Timer        timer_ = new Timer();

    public Retry(X x, ContextAgent agent) {
      x_     = x;
      agent_ = agent;
    }

    public void start() {
      if ( retryStrategy_.canRetry(x_) ) {
        retry();
      } else {
        ((Logger) x_.get("logger")).error(
          "RetryManager(" + description_ + ") max retry has been reached."
          , exception_);
      }
    }

    private void retry() {
      timer_.schedule(new TimerTask() {
        @Override
        public void run() {
          try {
            agent_.execute(x_);
            while ( latch_.getCount() > 0 ) {
              latch_.countDown();
            }
          } catch (Exception ex) {
            exception_ = ex;
            latch_.countDown();
            start();
          }
        }
      }, retryStrategy_.getRetryDelay(x_));
    }
  }

  public RetryManager(RetryStrategy retryStrategy, String description) {
    retryStrategy_ = retryStrategy;
    description_   = description;
    latch_         = new CountDownLatch(retryStrategy_.getMaxRetry());
  }

  public void submit(X x, ContextAgent agent) {
    new Retry(x, agent).start();
    try {
      latch_.await();
      System.out.println("---------- release count down latch");
    } catch (InterruptedException e) { /*ignored*/ }
  }
}
