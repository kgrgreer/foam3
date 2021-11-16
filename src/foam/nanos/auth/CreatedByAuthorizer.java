package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;

public class CreatedByAuthorizer extends StandardAuthorizer {

  public CreatedByAuthorizer(String permissionPrefix) {
    super(permissionPrefix);
  }

  @Override
  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof CreatedByAware ) {
      final var ata = (CreatedByAware) obj;

      final var subject = (Subject) x.get("subject");
      if ( subject != null && subject.getUser() != null ) {
        if ( subject.getUser().getId() == ata.getCreatedBy() )
          return;
      }
    }

    super.authorizeOnRead(x, obj);
  }
}
