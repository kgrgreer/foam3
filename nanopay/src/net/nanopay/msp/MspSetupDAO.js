foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspSetupDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A decorator to create msp groups and admin',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.auth.GroupPermissionJunction',
    'net.nanopay.admin.model.AccountStatus',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        MspInfo mspInfo = (MspInfo) obj;

        ServiceProvider spid = new ServiceProvider.Builder(x)
          .setEnabled(true)
          .setId(mspInfo.getSpid())
          .setDescription(mspInfo.getSpid() + " spid")
          .build();

        DAO spidDAO = (DAO) x.get("serviceProviderDAO");
        spidDAO.put(spid);

        DAO groupDAO = (DAO) x.get("localGroupDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");

        // Create spid-admin group
        Group adminGroup = new Group();
        adminGroup.setId(mspInfo.getSpid() + "-admin");
        adminGroup.setParent("msp-admin");
        adminGroup.setDefaultMenu("users");
        adminGroup.setDescription(mspInfo.getSpid() +" admin");
        groupDAO.put(adminGroup);

        // Create spid-admin user
        User adminUser = new User();
        adminUser.setEmail(mspInfo.getAdminUserEmail());
        adminUser.setDesiredPassword(mspInfo.getAdminUserPassword());
        adminUser.setFirstName(mspInfo.getAdminUserFirstname());
        adminUser.setLastName(mspInfo.getAdminUserLastname());
        adminUser.setGroup(mspInfo.getSpid() + "-admin");
        adminUser.setSpid(mspInfo.getSpid());
        adminUser.setEmailVerified(true);
        adminUser.setStatus(AccountStatus.ACTIVE);
        userDAO.put(adminUser);

        List<String> permissionArray = new ArrayList<>();
        permissionArray.add("group.update." + mspInfo.getSpid() + "-admin");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-fraud-ops");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-payment-ops");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-support");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-admin");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-fraud-ops");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-payment-ops");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-support");

        for ( int i = 0; i < permissionArray.size(); i++ ) {
          // Add the permissions of spid's groups to the spid-admin group
          GroupPermissionJunction junction = new GroupPermissionJunction();
          junction.setSourceId(mspInfo.getSpid() + "-admin");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(junction);

          // Add the permissions of spid's groups to the msp-admin group
          GroupPermissionJunction mspAdminJunction = new GroupPermissionJunction();
          junction.setSourceId("msp-admin");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(mspAdminJunction);
        }

        // Create spid-fraud-ops group
        Group fraudOpsGroup = new Group();
        fraudOpsGroup.setId(mspInfo.getSpid() + "-fraud-ops");
        fraudOpsGroup.setParent("fraud-ops");
        fraudOpsGroup.setDefaultMenu("accounts");
        fraudOpsGroup.setDescription(mspInfo.getSpid() + " fraud-ops group");
        groupDAO.put(fraudOpsGroup);

        // Create spid-payment-ops group
        Group paymentOpsGroup = new Group();
        paymentOpsGroup.setId(mspInfo.getSpid() + "-payment-ops");
        paymentOpsGroup.setParent("payment-ops");
        paymentOpsGroup.setDefaultMenu("accounts");
        paymentOpsGroup.setDescription(mspInfo.getSpid() + " payment-ops group");
        groupDAO.put(paymentOpsGroup);

        // Create spid-support group
        Group supportGroup = new Group();
        supportGroup.setId(mspInfo.getSpid() + "-support");
        supportGroup.setParent("support");
        supportGroup.setDefaultMenu("contacts");
        supportGroup.setDescription(mspInfo.getSpid() + " support group");
        groupDAO.put(supportGroup);

        return super.put_(x, obj);
      `
    }
  ]
});
