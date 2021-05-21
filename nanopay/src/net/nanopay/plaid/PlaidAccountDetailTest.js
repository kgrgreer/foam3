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
   name: 'PlaidAccountDetailTest',
   extends: 'foam.nanos.test.Test',

   javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'net.nanopay.plaid.model.PlaidAccountDetail'
   ],

   methods: [
     {
       name: 'runTest',
       javaCode: `
         User paymentOps = new User();
         DAO bareUserDAO = (DAO) x.get("bareUserDAO");
         DAO plaidAccountDetailDAO = (DAO) x.get("plaidAccountDetailDAO");
         PlaidAccountDetail plaidAccountDetail = new PlaidAccountDetail();
         boolean threw;

         paymentOps.setGroup("nanopay-payment-ops");
         paymentOps = (User) bareUserDAO.put(paymentOps);

         Session paymentOpsSession = new Session.Builder(x)
           .setUserId(paymentOps.getId())
           .build();

         X paymentOpsContext = paymentOpsSession.applyTo(x);

         threw = false;
         try {
           plaidAccountDetail = (PlaidAccountDetail) plaidAccountDetailDAO.inX(x).put(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(! threw, "Admin user can add plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(x).find(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(! threw, "Admin user can view plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(x).put(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(! threw, "Admin user can update plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(x).remove(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(! threw, "Admin user can remove plaidAccountDetail");

         plaidAccountDetail = (PlaidAccountDetail) plaidAccountDetailDAO.inX(x).put(plaidAccountDetail);

         threw = false;
         try {
           plaidAccountDetailDAO.inX(paymentOpsContext).put(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(threw, "payment-ops user can't add plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(paymentOpsContext).find(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(! threw, "payment-ops user can view plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(paymentOpsContext).put(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(threw, "payment-ops user can't update plaidAccountDetail");

         threw = false;
         try {
           plaidAccountDetailDAO.inX(paymentOpsContext).remove(plaidAccountDetail);
         } catch ( AuthorizationException e ) {
           threw = true;
         }
         test(threw, "payment-ops user can't remove plaidAccountDetail");
       `
     }
   ]
})
