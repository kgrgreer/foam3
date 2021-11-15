package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;

public class AssignedToAuthorizer extends StandardAuthorizer {

  public AssignedToAuthorizer(String permissionPrefix) {
    super(permissionPrefix);
  }

  @Override
  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof AssignedToAware ) {
      final var ata = (AssignedToAware) obj;

      final var subject = x.get(Subject.class);
      if ( subject != null && subject.getUser() != null ) {
        if ( subject.getUser().getId() == ata.getAssignedTo() )
          return;
      }
    }

    super.authorizeOnRead(x, obj);
  }
}
