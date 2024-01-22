/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.X;


public class GlobalCreateAuthorizer
  extends StandardAuthorizer
{

  // This authorizer is an extension of the standardauthorizer that is meant
  // to replace the the checkGlobalFind() method to allow any find().
  // Useful for DAO's where the id's are unknown and unguessable,
  // like token or invitation DAOs.

  public GlobalCreateAuthorizer(String permissionPrefix) {
    super(permissionPrefix);
  }

  @Override
  public void authorizeOnCreate(X x, FObject obj) {
    // NOP to enable put() of a new object
  }
}
