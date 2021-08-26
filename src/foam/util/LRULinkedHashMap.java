package foam.util;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.om.OMLogger;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-05-24.
 */
public class LRULinkedHashMap<K, V> extends LinkedHashMap<K, V> implements ContextAware {

  private static final String OM_MESSAGE_CACHE_HIT = "CacheHIT";
  private static final String OM_MESSAGE_CACHE_MISS = "CacheMISS";

  private static final int INITIAL_CACHE_SIZE = 16;

  private final int maxSize_;
  private final String cacheName_;
  private OMLogger omLogger_;
  private X x_;

  public LRULinkedHashMap(String cacheName, int maxSize) {
    super(INITIAL_CACHE_SIZE, 0.75f, true);

    this.cacheName_ = cacheName;
    this.maxSize_ = maxSize;
  }

  @Override
  public V get(Object key) {
    V result = super.get(key);

    // TODO: Remove once LRULinkedHashMap efficacy has been determined, auth checks are too frequent for OM profiling
    if ( result != null ) {
      omLogger_.log(this.getClass().getSimpleName(), this.cacheName_, OM_MESSAGE_CACHE_HIT);
    } else {
      omLogger_.log(this.getClass().getSimpleName(), this.cacheName_, OM_MESSAGE_CACHE_MISS);
    }

    return result;
  }

  @Override
  public V getOrDefault(Object key, V defaultValue) {
    V result = super.getOrDefault(key, defaultValue);

    // TODO: Remove once LRULinkedHashMap efficacy has been determined, auth checks are too frequent for OM profiling
    if ( result != null ) {
      omLogger_.log(this.getClass().getSimpleName(), this.cacheName_, OM_MESSAGE_CACHE_HIT);
    } else {
      omLogger_.log(this.getClass().getSimpleName(), this.cacheName_, OM_MESSAGE_CACHE_MISS);
    }

    return result;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() >= maxSize_;
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public synchronized void setX(X x) {
    if ( x_ == null ) {
      x_ = x;

      // TODO: Remove once LRULinkedHashMap efficacy has been determined, auth checks are too frequent for OM profiling
      if ( this.omLogger_ == null ) {
        this.omLogger_ = (OMLogger) getX().get("OMLogger");
      }
    }
  }
}
