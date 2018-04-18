package net.nanopay.migrate;

import com.mongodb.MongoClient;
import foam.core.ContextAware;
import foam.core.ContextAwareSupport;
import foam.core.X;
import org.bson.types.ObjectId;

import java.util.Map;

public abstract class AbstractMigration<T>
  implements Migration, ContextAware
{
  protected X x_;
  protected MongoClient client_;
  protected final boolean DEBUG = Main.DEBUG;

  public AbstractMigration(X x, MongoClient client) {
    x_ = x;
    client_ = client;
  }

  public abstract Map<ObjectId, T> migrate();

  public MongoClient getClient() {
    return client_;
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }
}
