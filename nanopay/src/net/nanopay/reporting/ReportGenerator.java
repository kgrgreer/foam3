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
import foam.nanos.auth.*;
import foam.util.SafetyUtil;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public abstract class ReportGenerator {

  protected Map<Object, CreatedAware> cacheMap = new HashMap<>();
  protected String spid;

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

  protected FObject generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    return dst;
  }

  public FObject generateReport(X x, Object src) {
    if ( src == null ) return null;

    if ( ! SafetyUtil.isEmpty(spid) ) {
      if ( src instanceof ServiceProviderAware ) {
        if ( ! ((ServiceProviderAware) src).getSpid().equals(spid) )
          return null;
      } else {
        throw new RuntimeException("SPID Aware ReportGenerator attempted to generate from non-SPID aware source model");
      }
    }

    // We can cache if the source model is LastModifiedAware
    if ( src instanceof LastModifiedAware ) {
      var id = getSourceId((FObject) src);

      var report = getCachedElement(id, ((LastModifiedAware) src).getLastModified());
      if ( report != null )
        return (FObject) report;

      report = generate(x, (FObject) src, null);

      if ( report instanceof CreatedAware ) {
        var ca = (CreatedAware) report;
        ca.setCreated(Calendar.getInstance().getTime());
        cacheMap.put(id, ca);
      }

      return (FObject) report;
    } else {
      return generate(x, (FObject) src, null);
    }
  }

  public ReportGenerator(String spid) {
    this.spid = spid;
  }

  public ReportGenerator() {
    this.spid = "";
  }

}
