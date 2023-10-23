/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.predicate.Predicate;

public class GlobalFindAuthorizer
  extends StandardAuthorizer
{

  // This authorizer is an extension of the standardauthorizer that is meant
  // to replace the the checkGlobalFind() method to allow any find().
  // Useful for DAO's where the id's are unknown and unguessable,
  // like token or invitation DAOs.

  public GlobalFindAuthorizer(String permissionPrefix) {
    super(permissionPrefix);
  }

  @Override
  public boolean checkGlobalFind(X x) {
    // return true to enable any find()
    return true;
  }
}
