package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.*;
import net.nanopay.contacts.Contact;
import net.nanopay.contacts.ContactStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;

import java.lang.reflect.Array;
import java.util.List;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

/**
 * When creating a new business, this decorator will create the groups for that
 * business, put the appropriate default permissions in them, and make sure the
 * user creating the business is in the admin group for the business.
 */
public class CreateBusinessDAO extends ProxyDAO {
  public DAO groupDAO;
  public DAO agentJunctionDAO;

  public CreateBusinessDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    groupDAO = ((DAO) x.get("groupDAO")).inX(x);
    agentJunctionDAO = ((DAO) x.get("agentJunctionDAO")).inX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( super.find_(x, obj) != null || ! ( obj instanceof Business ) ) {
      return super.put_(x, obj);
    }

    User user = (User) x.get("user");
    Business business = (Business) super.put_(x, obj);
    String safeBusinessName = business.getBusinessPermissionId();

    Group adminTemplateGroup = (Group) groupDAO.find("smeBusinessAdmin");
    Group approverTemplateGroup = (Group) groupDAO.find("smeBusinessApprover");
    Group employeeTemplateGroup = (Group) groupDAO.find("smeBusinessEmployee");

    Group employeeGroup = new Group();
    employeeGroup.copyFrom(employeeTemplateGroup);
    employeeGroup.setId(safeBusinessName + ".employee");
    employeeGroup.setParent("sme");
    employeeGroup = (Group) groupDAO.put(employeeGroup);
    generatePermissions(x, employeeTemplateGroup, employeeGroup, safeBusinessName);

    Group approverGroup = new Group();
    approverGroup.copyFrom(approverTemplateGroup);
    approverGroup.setId(safeBusinessName + ".approver");
    approverGroup.setParent(safeBusinessName + ".employee");
    approverGroup = (Group) groupDAO.put(approverGroup);
    generatePermissions(x, approverTemplateGroup, approverGroup, safeBusinessName);

    Group adminGroup = new Group();
    adminGroup.copyFrom(adminTemplateGroup);
    adminGroup.setId(safeBusinessName + ".admin");
    adminGroup.setParent(safeBusinessName + ".approver");
    adminGroup = (Group) groupDAO.put(adminGroup);
    generatePermissions(x, adminTemplateGroup, adminGroup, safeBusinessName);

    // Put the business itself in the admin group for the business.
    business = (Business) business.fclone();
    business.setGroup(safeBusinessName + ".admin");
    business.setEmailVerified(true);
    business = (Business) super.put_(x, business);

    // Create a relationship between the user and the business. Set the group on
    // the junction object to the admin group for that business.
    UserUserJunction junction = new UserUserJunction();
    junction.setGroup(adminGroup.getId());
    junction.setSourceId(user.getId());
    junction.setTargetId(business.getId());
    agentJunctionDAO.put(junction);

    return business;
  }

  // Given a template group with template permissions in the form
  // "model.action.id.subGroup", replace the "id" section of the permission with
  // a unique id for each business. For example, "group.update.id.*" would be
  // changed to "group.update.foobar123.*". Then that permission is added to a
  // new group which gets returned.
  public void generatePermissions(X x, Group templateGroup, Group realGroup, String safeBusinessName) {
    List<GroupPermissionJunction> junctions = ((ArraySink) templateGroup.getPermissions(x).getJunctionDAO().where(EQ(GroupPermissionJunction.SOURCE_ID, templateGroup.getId())).select(new ArraySink())).getArray();

    for ( GroupPermissionJunction junction : junctions ) {
      Permission newPermission = new Permission.Builder(x).setId(junction.getTargetId().replaceAll("\\.id\\.", "." + safeBusinessName + ".")).build();

      // Use the system context to pass the auth checks.
      realGroup.getPermissions(getX()).add(newPermission);
    }
  }
}
