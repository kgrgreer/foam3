package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import net.nanopay.model.Business;

import static foam.mlang.MLang.*;

/**
 * BusinessRegistrationAdapterDAO adapts putting BusinessRegistration to
 * putting User on smeBusinessRegistrationDAO then updates the userId and
 * businessId of the BusinessRegistration accordingly.
 */
public class BusinessRegistrationAdapterDAO extends ProxyDAO {
  public BusinessRegistrationAdapterDAO(X x, DAO delegate){
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    BusinessRegistration ret = (BusinessRegistration) obj;

    DAO smeBusinessRegistrationDAO = (DAO) x.get("smeBusinessRegistrationDAO");
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    User user = (User) smeBusinessRegistrationDAO.put_(x, adapt(x, ret));
    UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(
      EQ(UserUserJunction.SOURCE_ID, user.getId()));

    ret.setUserId(user.getId());
    if ( junction.findTargetId(x) instanceof Business ) {
      ret.setBusinessId(junction.getTargetId());
    }

    return super.put_(x, ret);
  }

  protected User adapt(X x, BusinessRegistration businessRegistration) {
    return new User.Builder(x)
      .setFirstName(businessRegistration.getFirstName())
      .setLastName(businessRegistration.getLastName())
      .setEmail(businessRegistration.getEmail())
      .setDesiredPassword(businessRegistration.getDesiredPassword())
      .setOrganization(businessRegistration.getOrganization())
      .setAddress(businessRegistration.getAddress())
      .build();
  }
}
