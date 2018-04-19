package net.nanopay.migrate;

import org.bson.types.ObjectId;

import java.util.Map;

public interface Migration<K, V> {
  Map<K, V> migrate();
}