package net.nanopay.migrate;

import org.bson.types.ObjectId;

import java.util.Map;

public interface Migration<T> {
  Map<ObjectId, T> migrate(String... args);
}