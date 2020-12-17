package net.nanopay.contacts;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.*;
import foam.nanos.logger.Logger;
import foam.test.TestUtils;
import foam.util.Auth;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;

public class ContactAuthorizationTest
  extends foam.nanos.test.Test
{
  private Group businessGroup_;
  private Group adminGroup_;
  private User adminUser_;
  private User businessUser_;
  private User otherBusinessUser_;
  private X adminUserContext_;
  private X businessUserContext_;
  private X otherBusinessUserContext_;
  private DAO userDAO_;
  private String testFirstName_ = "John";
  private String testLastName_ = "Smith";
  private String testEmail_ = "john@example.com";
  private String testOrganization_ = "AcmeCo";

  public void runTest(X x) {
    setupTestingSubcontext(x);

    resetTestData(x);
    Put_Create(businessUserContext_);
    resetTestData(x);
    Put_Update_Own(businessUserContext_);
    resetTestData(x);
    Put_Update_Other_Business(x);
    resetTestData(x);
    Find_Own(businessUserContext_);
    resetTestData(x);
    Find_Other_Business(x);
    resetTestData(x);
    Remove_Own(businessUserContext_);
    resetTestData(x);
    Remove_Other_Business(x);
    resetTestData(x);
    Select_Business(x);
    resetTestData(x);
    RemoveAll_Business(x);

    resetTestData(x);
    Find_Other_Admin(x);
    resetTestData(x);
    Remove_Other_Admin(x);
    resetTestData(x);
    Select_Admin(x);
    resetTestData(x);
    RemoveAll_Admin(x);
  }

  /**
   * Create a business user and an admin user as well as sub-contexts for both of them.
   */
  private void setupTestingSubcontext(X x) {
    try {
      userDAO_ = (DAO) x.get("localUserDAO");

      // Only admins can run tests, so just get the current user instead of
      // creating a new user and putting them in the admin group.
      adminUser_ = ((Subject) x.get("subject")).getUser();
      adminUserContext_ = x;

      // Delete the test user if it exists.
      User existing = getUserByEmail(userDAO_, "ContactAuthorizationTest@example.com");
      if (existing != null) {
        userDAO_.remove_(x, existing);
      }

      // Create the business user and put it in the userDAO.
      businessUser_ = new User();
      businessUser_.setEmail("ContactAuthorizationTest@example.com");
      businessUser_.setFirstName("Francis");
      businessUser_.setLastName("Filth");
      businessUser_.setGroup("business");
      businessUser_ = (User) userDAO_.put(businessUser_);
      businessUserContext_ = Auth.sudo(x, businessUser_);

      // Create other business user
      otherBusinessUser_ = new User();
      otherBusinessUser_.setEmail("ContactAuthorizationTest2@example.com");
      otherBusinessUser_.setFirstName("Francis");
      otherBusinessUser_.setLastName("Filth");
      otherBusinessUser_.setGroup("business");
      otherBusinessUser_ = (User) userDAO_.put(otherBusinessUser_);
      otherBusinessUserContext_ = Auth.sudo(x, otherBusinessUser_);
    } catch (Throwable t) {
      test(false, "Unexpected error setting up the testing data.");
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
    }
  }

  public User getUserByEmail(DAO userDAO, String emailAddress) {
    return (User) userDAO.find(EQ(User.EMAIL, emailAddress));
  }

  /**
   * Reset the test data to a known state.
   */
  private void resetTestData(X x) {
    DAO contactDAO = (DAO) x.get("contactDAO");
    contactDAO.removeAll();
  }

  private void Put_Create(X x) {
    try {
      User user = ((Subject) x.get("subject")).getUser();

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Conditions to check.
      boolean emailMatches = result.getEmail().equals(testEmail_);
      boolean firstNameMatches = result.getFirstName().equals(testFirstName_);
      boolean lastNameMatches = result.getLastName().equals(testLastName_);
      boolean organizationMatches = result.getOrganization().equals(testOrganization_);
      boolean ownerMatches = result.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can create contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Put_Create shouldn't throw an unexpected error.");
    }
  }

  private void Put_Update_Own(X x) {
    try {
      User user = ((Subject) x.get("subject")).getUser();

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Modify the result.
      result = (Contact) result.fclone();
      result.setLastName("Married");

      // Do the put to update.
      result = (Contact) user.getContacts(x).put_(x, result);

      // Conditions to check.
      boolean emailMatches = result.getEmail().equals(testEmail_);
      boolean firstNameMatches = result.getFirstName().equals(testFirstName_);
      boolean lastNameMatches = result.getLastName().equals("Married");
      boolean organizationMatches = result.getOrganization().equals(testOrganization_);
      boolean ownerMatches = result.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be 'Married' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can update their own contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Put_Update_Own shouldn't throw an unexpected error.");
    }
  }

  private void Put_Update_Other_Business(X x) {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for an admin.
      Contact result = (Contact) adminUser_.getContacts(adminUserContext_).put_(adminUserContext_, contact);

      // Modify the result.
      final Contact modified = (Contact) result.fclone();
      modified.setLastName("Married");

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the admin user's contact.
      test(
        TestUtils.testThrows(
          () -> contactDAO.put_(businessUserContext_, modified),
          "Permission denied.",
          AuthorizationException.class
        ),
        "Non-admin users cannot update other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Put_Update_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Find_Own(X x) {
    try {
      User user = ((Subject) x.get("subject")).getUser();

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Put the contact in the DAO so we can try to find it.
      Contact putResult = (Contact) user.getContacts(x).put_(x, contact);

      // Try to find the contact we just added.
      Contact findResult = (Contact) user.getContacts(x).find_(x, putResult.getId());

      // Conditions to check.
      boolean emailMatches = findResult.getEmail().equals(testEmail_);
      boolean firstNameMatches = findResult.getFirstName().equals(testFirstName_);
      boolean lastNameMatches = findResult.getLastName().equals(testLastName_);
      boolean organizationMatches = findResult.getOrganization().equals(testOrganization_);
      boolean ownerMatches = findResult.getOwner() == user.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + findResult.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + findResult.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + findResult.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + findResult.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + user.getId() + "' but it was '" + findResult.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Users in group " + user.getGroup() + " can find their own contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Find_Own shouldn't throw an unexpected error.");
    }
  }

  private void Find_Other_Admin(X x) {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for a business user.
      Contact putResult = (Contact) businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin find the business user's contact.
      Contact result = (Contact) contactDAO.find_(adminUserContext_, putResult.getId());

      // Conditions to check.
      boolean emailMatches = result.getEmail().equals(testEmail_);
      boolean firstNameMatches = result.getFirstName().equals(testFirstName_);
      boolean lastNameMatches = result.getLastName().equals(testLastName_);
      boolean organizationMatches = result.getOrganization().equals(testOrganization_);
      boolean ownerMatches = result.getOwner() == businessUser_.getId();

      // Helpful print statements to track down what went wrong.
      if ( ! emailMatches ) System.out.println("Expected email to be '" + testEmail_ + "' but it was '" + result.getEmail() + "'.");
      if ( ! firstNameMatches ) System.out.println("Expected first name to be '" + testFirstName_ + "' but it was '" + result.getFirstName() + "'.");
      if ( ! lastNameMatches ) System.out.println("Expected last name to be '" + testLastName_ + "' but it was '" + result.getLastName() + "'.");
      if ( ! organizationMatches ) System.out.println("Expected organization to be '" + testOrganization_ + "' but it was '" + result.getOrganization() + "'.");
      if ( ! ownerMatches ) System.out.println("Expected owner to be '" + businessUser_.getId() + "' but it was '" + result.getOwner() + "'.");

      test(
        emailMatches && firstNameMatches && lastNameMatches && organizationMatches && ownerMatches,
        "Admin users can find other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Find_Other_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Find_Other_Business(X x) {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for other business.
      Contact result = (Contact) otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the other user's contact.
      test(
        null == contactDAO.find_(businessUserContext_, result.getId()),
        "Non-admin users cannot find other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Find_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Own(X x) {
    try {
      User user = ((Subject) x.get("subject")).getUser();

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact putResult = (Contact) user.getContacts(x).put_(x, contact);

      // Remove the contact.
      user.getContacts(x).remove_(x, putResult);

      // Try to find the removed contact.
      Contact findResult = (Contact) user.getContacts(x).find_(x, putResult.getId());

      test(findResult == null, "Users in group " + user.getGroup() + " can remove their own contacts.");
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Remove_Own shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Other_Admin(X x) {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(adminUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for a business user.
      Contact putResult = (Contact) businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin remove the business user's contact.
      contactDAO.remove_(adminUserContext_, putResult);

      // Try to find the removed contact.
      Contact findResult = (Contact) contactDAO.find_(adminUserContext_, putResult.getId());

      test(findResult.getLifecycleState() == LifecycleState.DELETED, "Admin users can remove other users' contacts.");
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Remove_Other_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Remove_Other_Business(X x) {
    try {
      // Create a contact to put.
      Contact contact = new Contact.Builder(businessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for an other business.
      Contact putResult = (Contact) otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, contact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user update the other user's contact.
      test(
        TestUtils.testThrows(
          () -> contactDAO.remove_(businessUserContext_, putResult),
          "Permission denied.",
          AuthorizationException.class
        ),
        "Non-admin users cannot remove other users' contacts."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Remove_Other_Business shouldn't throw an unexpected error.");
    }
  }

  private void Select_Admin(X x) {
    try {
      // Create a contact for the other business to put.
      Contact otherBusinessContact = new Contact.Builder(otherBusinessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for other business user.
      otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, otherBusinessContact);

      // Do the put to create a contact for the business user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, EQ(Contact.LIFECYCLE_STATE, LifecycleState.ACTIVE));

      test(
        sink.getArray().size() == 2,
        "Admin users get all objects when selecting."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Select_Admin shouldn't throw an unexpected error.");
    }
  }

  private void Select_Business(X x) {
    try {
      // Create a contact for the other business to put.
      Contact otherBusinessContact = new Contact.Builder(otherBusinessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for other business user.
      otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, otherBusinessContact);

      // Do the put to create a contact for the business user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(businessUserContext_, sink, 0, Long.MAX_VALUE, null, null);

      test(
        sink.getArray().size() == 1,
        "Business users only get objects they own when selecting."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Select_Business shouldn't throw an unexpected error.");
    }
  }

  private void RemoveAll_Admin(X x) {
    try {
      // Create a contact for other business to put.
      Contact otherBusinessContact = new Contact.Builder(otherBusinessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for other business user.
      otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, otherBusinessContact);

      // Do the put to create a contact for the business user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) adminUserContext_.get("contactDAO");

      // Make the admin user removeAll on the contactDAO.
      contactDAO.removeAll_(adminUserContext_, 0, Long.MAX_VALUE, null, null);

      // Make the admin user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, EQ(Contact.LIFECYCLE_STATE, LifecycleState.ACTIVE));

      test(
        sink.getArray().size() == 0,
        "Admin users remove all objects when calling removeAll."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "RemoveAll_Admin shouldn't throw an unexpected error.");
    }
  }

  private void RemoveAll_Business(X x) {
    try {
      // Create a contact for the other business to put.
      Contact otherBusinessContact = new Contact.Builder(otherBusinessUserContext_).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Create a contact for the business user to put.
      Contact businessContact = new Contact.Builder(businessUserContext_).setFirstName(testLastName_).setLastName(testFirstName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create a contact for other business user.
      otherBusinessUser_.getContacts(otherBusinessUserContext_).put_(otherBusinessUserContext_, otherBusinessContact);

      // Do the put to create a contact for the business user.
      businessUser_.getContacts(businessUserContext_).put_(businessUserContext_, businessContact);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) businessUserContext_.get("contactDAO");

      // Make the business user removeAll on the contactDAO.
      contactDAO.removeAll_(businessUserContext_, 0, Long.MAX_VALUE, null, null);

      // Make the admin user select on the contactDAO.
      ArraySink sink = new ArraySink();
      contactDAO.select_(adminUserContext_, sink, 0, Long.MAX_VALUE, null, EQ(Contact.LIFECYCLE_STATE, LifecycleState.ACTIVE));

      test(
        sink.getArray().size() == 1,
        "Business users only remove objects they own when calling removeAll."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "RemoveAll_Business shouldn't throw an unexpected error.");
    }
  }

  private void Cannot_Set_Owner(X x) {
    try {
      User user = ((Subject) x.get("subject")).getUser();

      // Create a contact to put.
      Contact contact = new Contact.Builder(x).setFirstName(testFirstName_).setLastName(testLastName_).setEmail(testEmail_).setOrganization(testOrganization_).build();

      // Do the put to create.
      Contact result = (Contact) user.getContacts(x).put_(x, contact);

      // Change the owner to the other user.
      Contact modified = (Contact) result.fclone();
      modified.setOwner(user.getId() == 1 ? 2 : 1);

      // Get a direct reference to the contactDAO.
      DAO contactDAO = (DAO) x.get("contactDAO");

      test(
        TestUtils.testThrows(
          () -> contactDAO.put_(x, modified),
          "Changing the owner of a contact is not allowed.",
         AuthorizationException.class
        ),
        "Users in group '" + user.getGroup() + "' cannot set owner property."
      );
    } catch (Throwable t) {
      System.out.println(t.getMessage());
      Logger logger = (Logger) x.get("logger");
      logger.log(t);
      test(false, "Put_Update_Own shouldn't throw an unexpected error.");
    }
  }
}
