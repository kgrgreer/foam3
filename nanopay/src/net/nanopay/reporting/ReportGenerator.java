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
import foam.nanos.auth.ServiceProviderAware;
import foam.util.SafetyUtil;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.Calendar;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public abstract class ReportGenerator {

  protected Map<Object, FObject> cacheMap = new ConcurrentHashMap<>();
  protected String spid;
  protected boolean cached;

  protected FObject getCachedElement(Object elementId, Object src) throws IllegalArgumentException {
    if ( ! (src instanceof LastModifiedAware) ) throw new IllegalArgumentException("src model must be LastModifiedAware");
    var lastModified = (LastModifiedAware) src;

    var cachedfo = cacheMap.get(elementId);
    if ( cachedfo == null ) return null;

    var cached = (CreatedAware) cachedfo;
    if ( cached.getCreated() == null || cached.getCreated().before(lastModified.getLastModified()) ) {
      cacheMap.remove(elementId);
      return null;
    }

    return cachedfo;
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

    if ( cached ) {
      var id = getSourceId((FObject) src);
      try {
        var report = getCachedElement(id, src);
        if ( report != null )
          return report;

        report = generate(x, (FObject) src, null);
        if ( report instanceof ServiceProviderAware )
          ((ServiceProviderAware) report).setSpid(spid);

        if ( report instanceof CreatedAware ) {
          ((CreatedAware) report).setCreated(Calendar.getInstance().getTime());
          cacheMap.put(id, report);
        }

        return report;
      } catch(IllegalArgumentException ignored) {}
    }

    var report = generate(x, (FObject) src, null);
    if ( report instanceof ServiceProviderAware )
      ((ServiceProviderAware) report).setSpid(spid);

    return report;
  }

  public ReportGenerator(String spid, boolean cached) {
    this.cached = cached;
    this.spid = spid;
  }

  public ReportGenerator(String spid) {
    this(spid, true);
  }

}
