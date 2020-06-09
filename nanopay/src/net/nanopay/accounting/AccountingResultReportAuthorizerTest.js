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
  package: 'net.nanopay.accounting',
  name: 'AccountingResultReportAuthorizerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'net.nanopay.accounting.AccountingResultReport'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User nonAdminUser = new User();
        DAO bareUserDAO = (DAO) x.get("bareUserDAO");
        DAO accountingReportDAO = (DAO) x.get("accountingReportDAO");
        boolean threw;

        nonAdminUser.setGroup("");
        nonAdminUser = (User) bareUserDAO.put(nonAdminUser);

        Session nonAdminUserSession = new Session.Builder(x)
          .setUserId(nonAdminUser.getId())
          .build();

        X nonAdminContext = nonAdminUserSession.applyTo(x);
        Subject subject = new Subject.Builder(x).setUser(nonAdminUser).build();
        x = x.put("subject", subject);

        AccountingResultReport testResultReport = new AccountingResultReport();

        testResultReport.setId(112211);
        threw = false;
        try {
          accountingReportDAO.inX(x).put(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can add AccountingResultReport");

        threw = false;
        try {
          accountingReportDAO.inX(x).find(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can view AccountingResultReport");

        threw = false;
        try {
          accountingReportDAO.inX(x).put(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can update AccountingResultReport");

        threw = false;
        try {
          accountingReportDAO.inX(x).remove(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can remove AccountingResultReport");

        accountingReportDAO.inX(x).put(testResultReport);
        threw = false;
        try {
          accountingReportDAO.inX(nonAdminContext).put(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't add AccountingResultReport");

        test(accountingReportDAO.inX(nonAdminContext).find(testResultReport) == null, "Non admin user can't view AccountingResultReport");

        threw = false;
        try {
          accountingReportDAO.inX(nonAdminContext).put(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't update AccountingResultReport");

        threw = false;
        try {
          accountingReportDAO.inX(nonAdminContext).remove(testResultReport);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't remove AccountingResultReport");
      `
    }
  ]
})
