/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.FObject;
import foam.core.X;
import foam.dao.MDAO;

/**
 * MDAO for storing PMInfo's which disables cloning and freezing
 * so PMInfo's can be updated more quickly.
 **/
public class PMInfoMDAO extends MDAO
{
  private final FoldReducePMLogger frpmlogger_;

  public PMInfoMDAO(FoldReducePMLogger frpmlogger) {
    super(PMInfo.getOwnClassInfo());

    frpmlogger_ = frpmlogger;
  }

  public FObject objIn(FObject obj) {
    return obj;
  }

  public FObject objOut(FObject obj) {
    return obj;
  }

  public foam.core.FObject put_(X x, FObject obj) {
    PMInfo pmi = (PMInfo) obj;
    frpmlogger_.put(pmi);

    return super.put_(x, obj);
  }
}
