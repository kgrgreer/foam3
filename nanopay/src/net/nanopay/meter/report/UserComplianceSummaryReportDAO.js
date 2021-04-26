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
  package: 'net.nanopay.meter.report',
  name: 'UserComplianceSummaryReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A DAO decorator to generate the UserComplianceSummaryReport',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'net.nanopay.meter.report.UserComplianceSummaryReport',

    'static foam.mlang.MLang.*',
  ],

  messages: [
    { name: 'ENTITY_MSG', message: 'Entity' },
    { name: 'INDIVIDUAL_MSG', message: 'Individual' }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);

        // Retrieve the DAO
        DAO userDAO = (DAO) x.get("localUserDAO");

        userDAO.where(EQ(User.COMPLIANCE, ComplianceStatus.PASSED)).select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            User user = (User) obj;

            Address address = user.getAddress();

            UserComplianceSummaryReport pr = new UserComplianceSummaryReport.Builder(x)
              .setId("User : " + user.getId())
              .setCaseName(user.getOrganization())
              .setRelationshipType(user instanceof Business ? ENTITY_MSG : INDIVIDUAL_MSG)
              .setRelationshipId("User : " + user.getId())
              .setRelationshipName(user.getOrganization())
              .setFirstName(user.getFirstName())
              .setMiddleName(user.getMiddleName())
              .setSurname(user.getLastName())
              .setBirthday(user.getBirthday())
              .setOccupation(user.getJobTitle())
              .setIdentificationType(address != null ? address.getCountryId() : "")
              .setIdentificationValue(address != null ? address.getRegionId() : "")
              .setCountry(address != null ? address.getCountryId() : "")
              .setAddressLine(address != null ? address.getSuite() : "")
              .setAddressUrl(address != null ? address.getStreetNumber() + " " + address.getStreetName() : "")
              .setPhoneNumber(user.getPhoneNumber())
              .setCity(address != null ? address.getCity() : "")
              .setState(address != null ? address.getRegionId() : "")
              .setPostalCode(address != null ? address.getPostalCode() : "")
              .build();

            decoratedSink.put(pr, null);
          }
        });

        return sink;
      `
    }
  ]
});
