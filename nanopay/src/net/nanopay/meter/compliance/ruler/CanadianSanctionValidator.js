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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'CanadianSanctionValidator',

  documentation: `Validator that checks user and business against
    the Consolidated Canadian Autonomous Sanctions List.

    URL: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx

    The Consolidated Canadian Autonomous Sanctions List includes individuals and
    entities subject to specific sanctions regulations made under the Special
    Economic Measures Act (SEMA) and the Justice for Victims of Corrupt Foreign
    Officials Act (JVCFOA).`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        Predicate predicate = user instanceof Business
          ? new ContainsIC.Builder(x)
            .setArg1(prepare(Record.ENTITY))
            .setArg2(prepare(user.getBusinessName()))
            .build()
          : AND(
              EQ(Record.LAST_NAME, user.getLastName().toUpperCase()),
              EQ(Record.GIVEN_NAME, user.getFirstName().toUpperCase())
            );
        Count found = (Count) ((DAO) x.get("canadianSanctionDAO"))
          .where(predicate).limit(1).select(new Count());

        if ( found.getValue() == 1 ) {
          String message = String.format(
            "%s : The %s name '%s' was found in the Canadian sanction list."
            , getClass().getSimpleName()
            , user instanceof Business ? "business" : "individual"
            , user.toSummary());
          ruler.putResult(message);
          user.setCompliance(ComplianceStatus.FAILED);

          // Generate the notification sent to Fraud-ops group
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DAO localNotificationDAO = (DAO) x.get("localNotificationDAO");
              Notification notification = new Notification();
              notification.setBody(message);
              notification.setNotificationType("A SEMA/JVCFOA related user has signed up");
              notification.setGroupId(user.getSpid() + "-fraud-ops");
              localNotificationDAO.put(notification);
            }
          }, "Canadian Sanction Validator");
        }
      `
    }
  ]
});
