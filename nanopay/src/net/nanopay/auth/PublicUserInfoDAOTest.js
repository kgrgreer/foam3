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
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.auth.PublicUserInfoDAO',
    'net.nanopay.auth.TestWidget'
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
        Phone phone = new Phone();
        phone.setNumber("123-456-7890");
        testUser.setPhone(phone);
        File businessProfilePicFile = new File();
        businessProfilePicFile.setFilename("Business profile picture");
        testUser.setBusinessProfilePicture(businessProfilePicFile);
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
        TestWidget result = (TestWidget) dao.find(1);
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

        test(owner.getBusinessAddress() instanceof Address, "'owner.getBusinessAddress()' should be of type 'Address'.");
        test(owner.getBusinessAddress().equals(john.getAddress()), "'owner.getBusinessAddress()' should match the user's business address.");
        test(owner.getBusinessAddress().getCity().equals(john.getAddress().getCity()), "'owner.getBusinessAddress().getCity()' should match the user's business address city (Toronto).");

        test(owner.getBusinessPhone() instanceof Phone, "'owner.getBusinessPhone()' should be of type 'Phone'.");
        test(owner.getBusinessPhone().equals(john.getPhone()), "'owner.getBusinessPhone()' should match the user's business phone.");
        test(owner.getBusinessPhone().getNumber().equals(john.getPhone().getNumber()), "'owner.getBusinessPhone().getNumber()' should match the user's business phone number (123-456-7890).");

        test(owner.getBusinessProfilePicture() instanceof File, "'owner.getBusinessProfilePicture()' should be of type 'File'.");
        test(owner.getBusinessProfilePicture().equals(john.getBusinessProfilePicture()), "'owner.getBusinessProfilePicture()' should match the user's business profile picture.");
        test(owner.getBusinessProfilePicture().getFilename().equals("Business profile picture"), "'owner.getBusinessProfilePicture().getFilename()' should match the user's business profile picture file name (Business profile picture).");

        // Null values
        TestWidget badWidget = new TestWidget();
        badWidget.setId(2);
        badWidget.setName("spork");
        badWidget.setWeight(42);
        badWidget.setOwnerId(999); // No user with this id exists.
        badWidget.setName("badWidget");
        widgetDAO.put(badWidget);

        result = (TestWidget) dao.find(2);
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
