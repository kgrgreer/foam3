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

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.CreatedAware;
import foam.nanos.auth.LastModifiedAware;

import javax.annotation.Nonnull;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public abstract class ReportGenerator {

  protected Map<Object, CreatedAware> cacheMap = new HashMap<>();

  protected Object getCachedElement(Object elementId, Date lastModified) {
    var cached = cacheMap.get(elementId);
    if ( cached == null ) return null;
    if ( lastModified == null || cached.getCreated() == null || cached.getCreated().before(lastModified) ) {
      cacheMap.remove(elementId);
      return null;
    }
    return cached;
  }

  protected Object getSourceId(@Nonnull FObject object) {
    return object.getProperty("id");
  }

  protected abstract FObject generate(X x, @Nonnull FObject src);

  public FObject generateReport(X x, Object src) {
    if ( src == null ) return null;

    // We can cache if the source model is LastModifiedAware
    if ( src instanceof LastModifiedAware ) {
      var id = getSourceId((FObject) src);

      var report = getCachedElement(id, ((LastModifiedAware) src).getLastModified());
      if ( report != null )
        return (FObject) report;

      report = generate(x, (FObject) src);

      if ( report instanceof CreatedAware ) {
        var ca = (CreatedAware) report;
        ca.setCreated(Calendar.getInstance().getTime());
        cacheMap.put(id, ca);
      }

      return (FObject) report;
    } else {
      return generate(x, (FObject) src);
    }
  }

}
