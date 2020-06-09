/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'TestWidget',

  documentation: 'A model of an imaginary widget for testing.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Long',
      name: 'weight'
    },
    {
      class: 'Long',
      name: 'ownerId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'owner',
      storageTransient: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfoDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [

    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File'
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
        // Create a subcontext to avoid polluting the DAOs we're working with.
        x = x.put("bareUserDAO", new MDAO(User.getOwnClassInfo()));

        DAO widgetDAO = new MDAO(TestWidget.getOwnClassInfo());
        DAO dao = new PublicUserInfoDAO(x, "ownerId", "owner", widgetDAO);

        // Make sure the owner exists.
        DAO userDAO = (DAO) x.get("bareUserDAO");
        User testUser = new User();
        testUser.setId(1);
        testUser.setFirstName("John");
        testUser.setLastName("Smith");
        testUser.setBusinessName("Widgets International");
        testUser.setEmail("john@example.com");
        File profilePicFile = new File();
        profilePicFile.setFilename("Profile picture");
        testUser.setProfilePicture(profilePicFile);
        Address businessAddress = new Address();
        businessAddress.setCity("Toronto");
        testUser.setAddress(businessAddress);
        String phoneNumber = "123-456-7890";
        testUser.setPhoneNumber(phoneNumber);
        File businessProfilePicFile = new File();
        businessProfilePicFile.setFilename("Business profile picture");
        User john = (User) userDAO.put(testUser);

        // Put a widget in the DAO.
        TestWidget spork = (TestWidget) new TestWidget();
        spork.setId(1);
        spork.setName("spork");
        spork.setWeight(42);
        spork.setOwnerId(john.getId());
        spork.setName("spork");
        widgetDAO.put(spork);

        // Tests

        // Happy path
        TestWidget result = (TestWidget) dao.find(1l);
        PublicUserInfo owner = result.getOwner();

        test(owner != null, "Property to replace (owner) should not be null.");
        test(owner instanceof PublicUserInfo, "Property to replace (owner) should be of type 'PublicUserInfo'.");

        test(owner.getId() == 1, "'owner.getId()' should match the user's id.");
        test(owner.getFirstName().equals("John"), "'owner.getFirstName()' should match the user's first name (John).");
        test(owner.getLastName().equals("Smith"), "'owner.getLastName()' should match the user's last name (Smith).");
        test(owner.getBusinessName().equals("Widgets International"), "'owner.getBusinessName()' should match the user's business name (Widgets International).");
        test(owner.getEmail().equals("john@example.com"), "'owner.getEmail()' should match the user's email address (john@example.com).");

        test(owner.getProfilePicture().equals(john.getProfilePicture()), "'owner.getProfilePicture()' should match the user's profile picture.");
        test(owner.getProfilePicture().getFilename().equals("Profile picture"), "'owner.getProfilePicture().getFilename()' should match the user's profile picture file name (Profile picture).");

        test(owner.getAddress() instanceof Address, "'owner.getAddress()' should be of type 'Address'.");
        test(owner.getAddress().equals(john.getAddress()), "'owner.getAddress()' should match the user's business address.");
        test(owner.getAddress().getCity().equals(john.getAddress().getCity()), "'owner.getAddress().getCity()' should match the user's business address city (Toronto).");

        test(owner.getPhoneNumber().equals(john.getPhoneNumber()), "'owner.getPhoneNumber()' should match the user's business phone.");
        test(owner.getPhoneNumber().equals(john.getPhoneNumber()), "'owner.getPhoneNumber()' should match the user's business phone number (123-456-7890).");

        // Null values
        TestWidget badWidget = new TestWidget();
        badWidget.setId(2);
        badWidget.setName("spork");
        badWidget.setWeight(42);
        badWidget.setOwnerId(999); // No user with this id exists.
        badWidget.setName("badWidget");
        widgetDAO.put(badWidget);

        result = (TestWidget) dao.find(2l);
        test(result.getOwner() == null, "If there is no user with the matching id, then the destination property should be set to null.");

        // Test that appropriate errors are thrown in appropriate places.
        boolean threw = false;
        String message = "";
        try {
          new PublicUserInfoDAO(x, "dummy", "owner", widgetDAO);
        } catch (IllegalArgumentException exception) {
          threw = true;
          message = exception.getMessage();
        }
        test(threw && message.equals("Property 'dummy' does not exist on model 'net.nanopay.auth.TestWidget'."), "Should throw 'IllegalArgumentException' with appropriate message when the identification property doesn't exist.");

        threw = false;
        message = "";
        try {
          new PublicUserInfoDAO(x, "ownerId", "dummy", widgetDAO);
        } catch (IllegalArgumentException exception) {
          threw = true;
          message = exception.getMessage();
        }
        test(threw && message.equals("Property 'dummy' does not exist on model 'net.nanopay.auth.TestWidget'."), "Should throw 'IllegalArgumentException' with appropriate message when the destination property doesn't exist.");
      `
    }
  ]
});
