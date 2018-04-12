package net.nanopay.migrate;

import com.mongodb.MongoClient;
import net.nanopay.tx.model.Transaction;

import java.util.List;

public class TransactionMigration
  extends AbstractMigration<Transaction>
{
  public TransactionMigration(MongoClient client) {
    super(client);
  }

  @Override
  public List<Transaction> migrate(String... args) {
    return null;
  }
}
