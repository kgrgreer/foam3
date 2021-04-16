package net.nanopay.reporting;

import foam.core.X;
import foam.nanos.auth.LastModifiedAware;

import javax.annotation.Nonnull;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public abstract class ReportGenerator {

  protected Map<Object, LastModifiedAware> cacheMap = new HashMap<>();

  protected LastModifiedAware getCachedElement(Object element, Date lastModified) {
    var cached = cacheMap.get(element);
    if ( cached == null ) return null;
    if ( lastModified == null || cached.getLastModified() == null || cached.getLastModified().before(lastModified) ) {
      cacheMap.remove(element);
      return null;
    }
    return cached;
  }

  protected abstract Object getSourceId(@Nonnull Object object);

  protected abstract LastModifiedAware generate(X x, @Nonnull Object src, Object[] args);

  public Object generateReport(X x, LastModifiedAware src, Object[] args) {
    if ( src == null ) return null;
    var id = getSourceId(src);

    var report = getCachedElement(id, src.getLastModified());
    if ( report != null )
      return report;

    report = generate(x, src, args);

    cacheMap.put(id, report);
    return report;
  }

}
