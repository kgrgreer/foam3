/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.LastModifiedAware;
import foam.nanos.logger.Logger;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class CopyReportGenerator extends ReportGenerator {

  protected ClassInfo of;

  protected FObject generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    try {
      if ( dst == null )
        return ((FObject) of.newInstance()).copyFrom(src);
      return super.generate(x, src, dst.copyFrom(src));
    } catch (IllegalAccessException | InstantiationException e) {
      var logger = (Logger) x.get("logger");
      logger.error(e);
      return super.generate(x, src, null);
    }
  }

  public CopyReportGenerator(ClassInfo of) {
    this.of = of;
  }

}
