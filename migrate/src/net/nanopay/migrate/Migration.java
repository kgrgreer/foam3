package net.nanopay.migrate;

import com.mongodb.MongoClient;

import java.util.List;

public interface Migration<T> {
  List<T> migrate(String... args);
}