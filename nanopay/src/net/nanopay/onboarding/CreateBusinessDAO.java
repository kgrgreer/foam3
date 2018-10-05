package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Group;
import foam.nanos.auth.Permission;
import foam.nanos.auth.User;
import foam.nanos.auth.UserBusinessJunction;
import net.nanopay.model.Business;

/**
 * When creating a new business, this decorator will create the groups for that
 * business, put the appropriate default permissions in them, and make sure the
 * user creating the business is in the admin group for the business.
 */
public class CreateBusinessDAO extends ProxyDAO {
  public CreateBusinessDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( super.find_(x, obj) != null ) {
      return super.put_(x, obj);
    }

    User user = (User) x.get("user");
    Business business = (Business) super.put_(x, obj);
    String safeBusinessName = business.getBusinessPermissionId();

    // When creating a business, 3 groups are also created that are associated
    // with the business.
    DAO groupDAO  = (DAO) x.get("groupDAO");

    Group adminTemplateGroup = (Group) groupDAO.find_(x, "smeBusinessAdmin");
    Group approverTemplateGroup = (Group) groupDAO.find_(x, "smeBusinessApprover");
    Group employeeTemplateGroup = (Group) groupDAO.find_(x, "smeBusinessEmployee");

    Group adminGroup = new Group();
    adminGroup.setId(safeBusinessName + ".admin");
    adminGroup.setPermissions(generatePermissions(adminTemplateGroup, safeBusinessName));
    groupDAO.put_(x, adminGroup);

    Group approverGroup = new Group();
    approverGroup.setId(safeBusinessName + ".approver");
    approverGroup.setPermissions(generatePermissions(approverTemplateGroup, safeBusinessName));
    groupDAO.put_(x, approverGroup);

    Group employeeGroup = new Group();
    employeeGroup.setId(safeBusinessName + ".employee");
    employeeGroup.setPermissions(generatePermissions(employeeTemplateGroup, safeBusinessName));
    groupDAO.put_(x, employeeGroup);

    // Associate the groups with the business.
    business.getGroups(x).put_(x, adminGroup);
    business.getGroups(x).put_(x, approverGroup);
    business.getGroups(x).put_(x, employeeGroup);

    // Create a relationship between the user and the business. Set the group on
    // the junction object to the admin group for that business.
    UserBusinessJunction junction = new UserBusinessJunction();
    junction.setGroup(adminGroup.getId());
    junction.setSourceId(user.getId());
    junction.setTargetId(business.getId());
    user.getBusinesses(x).getJunctionDAO().put_(x, junction);

    return business;
  }

  // Given a template group with template permissions in the form
  // "model.action.id.subGroup", replace the "id" section of the permission with
  // a unique id for each business. For example, "group.update.id.*" would be
  // changed to "group.update.foobar123.*". Then that permission is added to a
  // new group which gets returned.
  public Permission[] generatePermissions(Group templateGroup, String safeBusinessName) {
    Permission[] templatePermissions = templateGroup.getPermissions();
    Permission[] newPermissions = new Permission[templatePermissions.length];
    for ( int i = 0; i < templatePermissions.length; i++ ) {
      Permission templatePermission = templatePermissions[i];
      newPermissions[i] = new Permission(templatePermission.getId().replaceAll("\\.id\\.", "." + safeBusinessName + "."), templatePermission.getDescription());
    }
    return newPermissions;
  }
}
