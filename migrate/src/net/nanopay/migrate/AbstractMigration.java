package net.nanopay.migrate;

import com.mongodb.MongoClient;

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
}
