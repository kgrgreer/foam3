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
  public DAO contactDAO;
  public DAO invoiceDAO;
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
    // There's some sort of race condition with the way DAO services are started.
    // By getting these DAOs here instead of in the constructor, we can avoid
    // the race condition. These can be moved back to the constructor when we
    // fix that bug.
    contactDAO = ((DAO) x.get("localContactDAO")).inX(getX());
    invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(getX());

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
    employeeGroup.setBusiness(business.getId());
    employeeGroup.setParent("sme");
    employeeGroup = (Group) groupDAO.put(employeeGroup);
    generatePermissions(x, employeeTemplateGroup, employeeGroup, safeBusinessName);

    Group approverGroup = new Group();
    approverGroup.copyFrom(approverTemplateGroup);
    approverGroup.setId(safeBusinessName + ".approver");
    approverGroup.setBusiness(business.getId());
    approverGroup.setParent(safeBusinessName + ".employee");
    approverGroup = (Group) groupDAO.put(approverGroup);
    generatePermissions(x, approverTemplateGroup, approverGroup, safeBusinessName);

    Group adminGroup = new Group();
    adminGroup.copyFrom(adminTemplateGroup);
    adminGroup.setId(safeBusinessName + ".admin");
    adminGroup.setBusiness(business.getId());
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

    updateContacts(user, business);

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

  /**
   * Update the contacts in the system that reference the user that is creating
   * this Business.
   * @param {User} user The user creating the business.
   * @param {Business} business The business being created.
   */
  public void updateContacts(User user, Business business) {
    ArraySink sink = (ArraySink) contactDAO.where(EQ(Contact.EMAIL, user.getEmail())).select(new ArraySink());
    List<Contact> contacts = sink.getArray();
    for ( Contact contact : contacts ) {
      Contact updatedContact = (Contact) contact.fclone();
      updatedContact.setBusinessId(business.getId());
      updatedContact.setSignUpStatus(ContactStatus.ACTIVE);
      updatedContact.setEmail(business.getEmail());
      contactDAO.put(updatedContact);
      updateInvoices(contact, business);
    }
  }

  /**
   * Update the invoices in the system that reference the contact that
   * references (via matching email) the user that is creating this Business.
   * @param {User} user The user creating the business.
   * @param {Business} business The business being created.
   */
  public void updateInvoices(Contact contact, Business business) {
    long contactId = contact.getId();
    ArraySink sink = (ArraySink) invoiceDAO
      .where(OR(
        EQ(Invoice.PAYEE_ID, contactId),
        EQ(Invoice.PAYER_ID, contactId)))
      .select(new ArraySink());
    List<Invoice> invoices = sink.getArray();
    for ( Invoice invoice : invoices ) {
      Invoice updatedInvoice = (Invoice) invoice.fclone();
      if ( invoice.getPayerId() == contactId ) {
        updatedInvoice.setPayerId(business.getId());
      } else {
        updatedInvoice.setPayeeId(business.getId());
      }
      invoiceDAO.put(updatedInvoice);
    }
  }
}
