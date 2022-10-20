package foam.core;

public class ProxyAgency implements Agency {
  public Agency delegate_;

  public ProxyAgency(Agency delegate) {
    delegate_ = delegate;
  }

  @Override
  public void submit(X x, ContextAgent agent, String description) {
    delegate_.submit(x, agent, description);
  }

  @Override
  public void schedule(X x, ContextAgent agent, String key, long delay) {
    delegate_.schedule(x, agent, key, delay);
  }
}
