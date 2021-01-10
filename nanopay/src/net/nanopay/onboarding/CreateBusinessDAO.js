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
  package: 'net.nanopay.onboarding',
  name: 'CreateBusinessDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    When creating a new business, this decorator will create the groups for that
    business, put the appropriate default permissions in them, and make sure the
    user creating the business is in the admin group for the business.
  `,

  javaImports: [
    'static foam.mlang.MLang.EQ',

    'java.util.List',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.*',
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'groupDAO',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'agentJunctionDAO',
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CreateBusinessDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setGroupDAO(((DAO) x.get("groupDAO")).inX(x));
            setAgentJunctionDAO(((DAO) x.get("agentJunctionDAO")).inX(x));
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( super.find_(x, obj) != null || ! ( obj instanceof Business ) ) {
          return super.put_(x, obj);
        }

        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();
        Business business = (Business) super.put_(x, obj);
        String safeBusinessName = business.getBusinessPermissionId();

        Group adminTemplateGroup = (Group) getGroupDAO().find("smeBusinessAdmin");
        Group employeeTemplateGroup = (Group) getGroupDAO().find("smeBusinessEmployee");

        String groupId = "sme";
        Group parentSmeGroup = (Group) getGroupDAO().find(user.getSpid() + "-sme");
        if ( parentSmeGroup != null ) {
          groupId = parentSmeGroup.getId();
        }

        Group employeeGroup = new Group();
        employeeGroup.copyFrom(employeeTemplateGroup);
        employeeGroup.setId(safeBusinessName + ".employee");
        employeeGroup.setParent(groupId);
        employeeGroup = (Group) getGroupDAO().put(employeeGroup);
        generatePermissions(x, employeeTemplateGroup, employeeGroup, safeBusinessName);

        Group adminGroup = new Group();
        adminGroup.copyFrom(adminTemplateGroup);
        adminGroup.setId(safeBusinessName + ".admin");
        adminGroup.setParent(safeBusinessName + ".employee");
        adminGroup = (Group) getGroupDAO().put(adminGroup);
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
        getAgentJunctionDAO().put(junction);

        return business;
      `
    },
    {
      name: 'generatePermissions',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Group', name: 'templateGroup' },
        { type: 'Group', name: 'realGroup' },
        { type: 'String', name: 'safeBusinessName' }
      ],
      documentation: `
        Given a template group with template permissions in the form
        "model.action.id.subGroup", replace the "id" section of the permission with
        a unique id for each business. For example, "group.update.id.*" would be
        changed to "group.update.foobar123.*". Then that permission is added to a
        new group which gets returned.
      `,
      javaCode: `
        List<GroupPermissionJunction> junctions = ((ArraySink) templateGroup.getPermissions(x).getJunctionDAO().where(EQ(GroupPermissionJunction.SOURCE_ID, templateGroup.getId())).select(new ArraySink())).getArray();

        for ( GroupPermissionJunction junction : junctions ) {
          Permission newPermission = new Permission.Builder(x).setId(junction.getTargetId().replace(".id.", "." + safeBusinessName + ".")).build();

          // Use the system context to pass the auth checks.
          realGroup.getPermissions(getX()).add(newPermission);
        }
      `
    }
  ]
});

