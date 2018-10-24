package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.Permission;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.util.Auth;
import net.nanopay.model.Business;

/**
 * When creating a new business, this decorator will create the groups for that
 * business, put the appropriate default permissions in them, and make sure the
 * user creating the business is in the admin group for the business.
 */
public class CreateBusinessDAO extends ProxyDAO {
  public DAO groupDAO;

  public CreateBusinessDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    groupDAO = ((DAO) x.get("groupDAO")).inX(x);
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
    Group adminTemplateGroup = (Group) groupDAO.find("smeBusinessAdmin");
    Group approverTemplateGroup = (Group) groupDAO.find("smeBusinessApprover");
    Group employeeTemplateGroup = (Group) groupDAO.find("smeBusinessEmployee");

    Group adminGroup = new Group();
    adminGroup.setId(safeBusinessName + ".admin");
    adminGroup.setPermissions(generatePermissions(x, adminTemplateGroup, safeBusinessName));
    adminGroup.setBusiness(business.getId());
    groupDAO.put(adminGroup);

    Group approverGroup = new Group();
    approverGroup.setId(safeBusinessName + ".approver");
    approverGroup.setPermissions(generatePermissions(x, approverTemplateGroup, safeBusinessName));
    approverGroup.setBusiness(business.getId());
    groupDAO.put(approverGroup);

    Group employeeGroup = new Group();
    employeeGroup.setId(safeBusinessName + ".employee");
    employeeGroup.setPermissions(generatePermissions(x, employeeTemplateGroup, safeBusinessName));
    employeeGroup.setBusiness(business.getId());
    groupDAO.put(employeeGroup);

    // Put the business itself in the admin group for the business.
    business = (Business) business.fclone();
    business.setGroup(safeBusinessName + ".admin");
    business = (Business) super.put_(x, business);

    // Create a relationship between the user and the business. Set the group on
    // the junction object to the admin group for that business.
    X businessContext = Auth.sudo(x, business);
    UserUserJunction junction = new UserUserJunction();
    junction.setGroup(adminGroup.getId());
    junction.setSourceId(user.getId());
    junction.setTargetId(business.getId());
    business.getAgents(businessContext).getJunctionDAO().inX(businessContext).put(junction);

    return business;
  }

  // Given a template group with template permissions in the form
  // "model.action.id.subGroup", replace the "id" section of the permission with
  // a unique id for each business. For example, "group.update.id.*" would be
  // changed to "group.update.foobar123.*". Then that permission is added to a
  // new group which gets returned.
  public Permission[] generatePermissions(X x, Group templateGroup, String safeBusinessName) {
    DAO permissionDAO  = (DAO) x.get("permissionDAO");
    Permission[] templatePermissions = templateGroup.getPermissions();
    Permission[] newPermissions = new Permission[templatePermissions.length];
    for ( int i = 0; i < templatePermissions.length; i++ ) {
      Permission templatePermission = templatePermissions[i];
      Permission newPermission = new Permission(templatePermission.getId().replaceAll("\\.id\\.", "." + safeBusinessName + "."), templatePermission.getDescription());
      newPermissions[i] = newPermission;
      permissionDAO.put_(x, newPermission);
    }
    return newPermissions;
  }
}
