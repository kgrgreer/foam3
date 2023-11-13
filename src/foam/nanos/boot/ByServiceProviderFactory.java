/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.X;
import foam.core.XFactory;

/**
 * An XFactory which returns a service from the supplied context which is
 * either suffixed with the _<spid> or just _ if no spid is found or that
 * service isn't found.
 *
 * The purpose of this is so that NSpec's can be scoped by SPID.
 **/
public class ByServiceProviderFactory
  implements XFactory, NSpecAware
{

  protected NSpec spec_;

  public ByServiceProviderFactory() {
  }

  // impl NSpecAware
  public NSpec getNSpec() { return spec_; }

  public void setNSpec(NSpec spec) { spec_ = spec; }

  public void clearNSpec() { }

  // impl XFactory
  public Object create(X x) {
    String spid = (String) x.get("spid");

    if ( spid != null ) {
      Object service = x.get(getNSpec().getName() + "_" + spid);

      if ( service != null ) return service;
    }

    return x.get(getNSpec().getName() + "_");
  }
}
