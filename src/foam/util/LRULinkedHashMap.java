package foam.util;

import foam.core.X;
import foam.core.XLocator;
import foam.nanos.om.OMLogger;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-05-24.
 */
public class LRULinkedHashMap<K, V> extends LinkedHashMap<K, V> {

  private static final String OM_MESSAGE_CACHE_HIT = "CacheHIT";
  private static final String OM_MESSAGE_CACHE_MISS = "CacheMISS";

  private final int maxSize_;
  private final String cacheName_;
  private OMLogger omLogger_;

  public LRULinkedHashMap(String cacheName, int maxSize) {
    super(maxSize, 0.75f, true);
    this.cacheName_ = cacheName;
    this.maxSize_ = maxSize;
  }

  @Override
  public V get(Object key) {
    V result = super.get(key);

    if (result != null) {
      logOM(cacheName_, OM_MESSAGE_CACHE_HIT);
    } else {
      logOM(cacheName_, OM_MESSAGE_CACHE_MISS);
    }

    return result;
  }

  @Override
  public V getOrDefault(Object key, V defaultValue) {
    V result = super.getOrDefault(key, defaultValue);

    if ( result != null ) {
      logOM(cacheName_, OM_MESSAGE_CACHE_HIT);
    } else {
      logOM(cacheName_, OM_MESSAGE_CACHE_MISS);
    }

    return result;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() >= maxSize_;
  }

  private void logOM(String cache, String message) {
    // Retrieve OM logger from service locator if it is available
    if ( omLogger_ == null) {
      try {
        X x = XLocator.get();
        if (x != null) {
          omLogger_ = (OMLogger) x.get("OMLogger");
        }
      } catch (NullPointerException npe) {
        // Failed to retrieve OM logger from context
      }
    }

    if ( omLogger_ != null ) {
      omLogger_.log(this.getClass().getSimpleName(), cache, message);
    }
  }
}
