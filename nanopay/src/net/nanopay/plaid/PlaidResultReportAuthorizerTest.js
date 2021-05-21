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
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReportAuthorizerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.session.Session',
    'foam.nanos.test.Test',
    'foam.nanos.auth.User',
    'net.nanopay.plaid.PlaidResultReport',
  ],

  documentation: 'Class to test PlaidResultReportDAO security',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        PlaidResultReport plaidResultReport = new PlaidResultReport();
        DAO plaidResultReportDAO = (DAO) x.get("plaidResultReportDAO");

        User smeUser = new User();
        User owner = new User();

        boolean threw;

        smeUser.setGroup("sme");

        DAO bareUserDAO = (DAO) x.get("bareUserDAO");

        smeUser = (User) bareUserDAO.put(smeUser);
        owner = (User) bareUserDAO.put(owner);

        Session smeUserSession = new Session.Builder(x)
                .setUserId(smeUser.getId())
                .build();

        X smeContext = smeUserSession.applyTo(x);

        threw = false;
        try {
          plaidResultReport = (PlaidResultReport) plaidResultReportDAO.inX(smeContext).put(plaidResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Sme user can add plaidResultReport");

        threw = false;
        try {
          plaidResultReportDAO.inX(smeContext).find(plaidResultReport);
        } catch ( AuthorizationException e ){
          threw = true;
        }
        test(! threw, "Sme user can't view plaidResultReport");

        threw = false;
        try {
          plaidResultReport.setCompanyName("01");
          plaidResultReportDAO.inX(smeContext).put(plaidResultReport);
        } catch ( AuthorizationException e ){
          threw = true;
        }
        test(threw, "Sme user can't update plaidResultReport");

        threw = false;
        try {
          plaidResultReportDAO.inX(smeContext).remove(plaidResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Sme user can't delete plaidResultReport");


        Session ownerSession = new Session.Builder(x)
                        .setUserId(owner.getId())
                        .build();

        X ownerContext = smeUserSession.applyTo(x);

        plaidResultReport.setNanopayUserId(owner.getId());
        plaidResultReport = (PlaidResultReport) plaidResultReportDAO.inX(x).put(plaidResultReport);
        threw = false;
        try {
          plaidResultReport.setCompanyName("02");
          plaidResultReport = (PlaidResultReport) plaidResultReportDAO.put(plaidResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Owner can update plaidResultReport into plaidResultReportDAO");

        threw = false;
        try {
          plaidResultReport = (PlaidResultReport) plaidResultReportDAO.find(plaidResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Owner can view plaidResultReport");

        threw = false;
        try {
          plaidResultReportDAO.remove(plaidResultReport);
        } catch ( AuthorizationException e ){
          threw = true;
        }
        test(threw, "Owner can't delete plaidResultReport");
      `
    }
  ]
})
