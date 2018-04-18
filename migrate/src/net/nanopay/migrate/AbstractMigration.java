package net.nanopay.migrate;

import com.mongodb.MongoClient;
import foam.core.ContextAware;
import foam.core.X;
import org.bson.types.ObjectId;

import java.util.Map;

public abstract class AbstractMigration<T>
  implements Migration, ContextAware
{
  protected X x_;
  protected MongoClient client_;
  protected final MigrationMode MODE = Main.MODE;

  protected final String maindb;
  protected final String brokerdb;
  protected final String cryptodb;
  protected final String prefix;

  public AbstractMigration(X x, MongoClient client) {
    x_ = x;
    client_ = client;
    switch ( MODE ) {
      case STAGING:
        maindb = "staging";
        brokerdb = "broker-staging";
        cryptodb = "crypto-service-staging";
        prefix = "STAGING/";
        break;

      case PRODUCTION:
        maindb = "prod";
        brokerdb = "broker-prod";
        cryptodb = "crypto-service-prod";
        prefix = "PRODUCTION/";
        break;

      default:
        maindb = "development";
        brokerdb = "broker";
        cryptodb = "crypto-service";
        prefix = "DEVELOPMENT/";
        break;
    }
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
