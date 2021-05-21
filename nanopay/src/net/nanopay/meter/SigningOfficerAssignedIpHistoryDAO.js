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
  package: 'net.nanopay.meter',
  name: 'SigningOfficerAssignedIpHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Decorating DAO for capturing user IP address when
    assigning user as signing officer.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.model.BusinessUserJunction',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        /**
         * When a new junction is created in 'signingOfficerJunctionDAO', it
         * signifies that a signing officer has been added to a business.
         */
        BusinessUserJunction junc = (BusinessUserJunction) obj;
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User signingOfficer = (User) localUserDAO.inX(x).find(junc.getTargetId());

        IpHistoryService ipHistoryService = new IpHistoryService(x);
        String description = String.format("Signing officer: assigned to %s", signingOfficer.getEmail());
        ipHistoryService.record(signingOfficer, description);

        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        /**
         * When a junction is removed from 'signingOfficerJunctionDAO', it
         * signifies that a signing officer has been removed from a business.
         */
        BusinessUserJunction junc = (BusinessUserJunction) obj;
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User signingOfficer = (User) localUserDAO.inX(x).find(junc.getTargetId());

        IpHistoryService ipHistoryService = new IpHistoryService(x);
        String description = String.format("Signing officer: revoked from %s", signingOfficer.getEmail());
        ipHistoryService.record(signingOfficer, description);

        return super.remove_(x, obj);
      `
    }
  ]
});
