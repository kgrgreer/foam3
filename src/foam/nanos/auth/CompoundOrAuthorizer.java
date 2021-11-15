/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.predicate.Predicate;

import java.util.Arrays;
import java.util.function.Consumer;

public class CompoundOrAuthorizer implements Authorizer {

  protected Authorizer[] authorizers_;

  public CompoundOrAuthorizer(Authorizer[] authorizers) {
    authorizers_ = authorizers;
  }

  // Shortcut for testing all authorizers
  protected void consume(Consumer<Authorizer> c) throws foam.nanos.auth.AuthorizationException {
    for ( final var authorizer : authorizers_ ) {
      try {
        c.accept(authorizer);
      } catch(Exception ignored) {
        continue;
      }
      return;
    }
    throw new AuthorizationException();
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    consume(authorizer -> authorizer.authorizeOnCreate(x, obj));
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    consume(authorizer -> authorizer.authorizeOnRead(x, obj));
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject newObj) throws AuthorizationException {
    consume(authorizer -> authorizer.authorizeOnUpdate(x, oldObj, newObj));
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    consume(authorizer -> authorizer.authorizeOnDelete(x, obj));
  }

  public boolean checkGlobalRead(X x, Predicate predicate) {
    return Arrays.stream(authorizers_).anyMatch(authorizer -> checkGlobalRead(x, predicate));
  }

  public boolean checkGlobalRemove(X x) {
    return Arrays.stream(authorizers_).anyMatch(authorizer -> checkGlobalRemove(x));
  }
}
