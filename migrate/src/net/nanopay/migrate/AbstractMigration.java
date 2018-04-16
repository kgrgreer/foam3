package net.nanopay.migrate;

import com.mongodb.MongoClient;
import org.bson.types.ObjectId;

import java.util.Map;

public abstract class AbstractMigration<T>
  implements Migration
{
  protected MongoClient client_;

  public AbstractMigration(MongoClient client) {
    client_ = client;
  }

  public MongoClient getClient() {
    return client_;
  }

  public abstract Map<ObjectId, T> migrate(String... args);
}
