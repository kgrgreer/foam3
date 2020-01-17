package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import net.nanopay.contacts.Contact;

/**
 * This decorator checks if a new Ablii user is being created and if so, it
 * checks if the new user's email address has been whitelisted by us. If it
 * hasn't been whitelisted, throw an error with an explanation about the beta.
 */
public class CheckEmailWhitelistDAO
  extends ProxyDAO
{
  protected AppConfig config;
  private DAO       whitelistedEmailDAO_;
  private DAO       groupDAO_;

  public CheckEmailWhitelistDAO(X x, DAO delegate) {
    super(x, delegate);
    config               = (AppConfig) x.get("appConfig");
    whitelistedEmailDAO_ = (DAO)       x.get("whitelistedEmailDAO");
    groupDAO_            = (DAO)       x.get("groupDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User userBeingCreated = (User) obj;

    if ( ! config.getWhiteListEnabled() ) return super.put_(x, obj);

    // We only want to apply the whitelist to Ablii users.
    Group   group       = (Group) groupDAO_.find(userBeingCreated.getGroup());
    boolean isAbliiUser = group != null && group.isDescendantOf("sme", groupDAO_);

    if ( ! isAbliiUser ) return super.put_(x, obj);

    // We only care about new users and businesses being created here, not
    // contacts.
    boolean isUpdate  = getDelegate().inX(x).find(obj.getProperty("id")) != null;
    boolean isContact = obj instanceof Contact;

    if ( isUpdate || isContact ) return super.put_(x, obj);

    boolean isEmailWhitelisted = whitelistedEmailDAO_.inX(x).find(userBeingCreated.getEmail()) != null;

    if ( ! isEmailWhitelisted ) {
      throw new AuthorizationException("Hi! We're currently in beta, so only approved emails can be used to sign up. Please email us at hello@ablii.com if you'd like to participate in the beta.");
    }

    return super.put_(x, obj);
  }
}
