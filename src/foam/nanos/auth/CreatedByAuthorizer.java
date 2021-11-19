/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.predicate.Predicate;

// Example of a property based custom authorizer
public class CreatedByAuthorizer implements Authorizer {
  protected void authorize(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof CreatedByAware ) {
      final var ata = (CreatedByAware) obj;

      final var subject = (Subject) x.get("subject");
      if ( subject != null && subject.getUser() != null ) {
        if ( subject.getUser().getId() == ata.getCreatedBy() )
          return;
      }
    }

    throw new AuthorizationException();
  }

  @Override
  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    throw new AuthorizationException();
  }

  @Override
  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    authorize(x, obj);
  }

  @Override
  public void authorizeOnUpdate(X x, FObject oldObj, FObject newObj) throws AuthorizationException {
    authorize(x, oldObj);
    authorize(x, newObj);
  }

  @Override
  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    authorize(x, obj);
  }

  @Override
  public boolean checkGlobalRead(X x, Predicate predicate) {
    return false;
  }

  @Override
  public boolean checkGlobalRemove(X x) {
    return false;
  }
}
