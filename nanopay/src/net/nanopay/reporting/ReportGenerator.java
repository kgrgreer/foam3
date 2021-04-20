/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */


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

  protected abstract LastModifiedAware generate(X x, @Nonnull Object src);

  public Object generateReport(X x, LastModifiedAware src) {
    if ( src == null ) return null;
    var id = getSourceId(src);

    var report = getCachedElement(id, src.getLastModified());
    if ( report != null )
      return report;

    report = generate(x, src);

    cacheMap.put(id, report);
    return report;
  }

}
