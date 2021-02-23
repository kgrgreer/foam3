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
  package: 'net.nanopay.sme.onboarding',
  name: 'CanadaUsBusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    This decorator handles adding and updating Canadian businesses information for US payments capabilities.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( ! (obj instanceof CanadaUsBusinessOnboarding) ) return getDelegate().put_(x, obj);
        
        CanadaUsBusinessOnboarding businessOnboarding = (CanadaUsBusinessOnboarding) obj;
        CanadaUsBusinessOnboarding old = (CanadaUsBusinessOnboarding)getDelegate().find_(x, obj);

        // if the businessOnboarding is already set to SUBMITTED, do not allow modification
        if ( old != null && old.getStatus() == net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) return getDelegate().put_(x, businessOnboarding);

        // ACCEPTANCE DOCUMENTS
        Long oldAgreementAFEX = old == null ? 0 : old.getAgreementAFEX();
        if ( oldAgreementAFEX != businessOnboarding.getAgreementAFEX() ) {
          AcceptanceDocumentService documentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          documentService.updateUserAcceptanceDocument(x, businessOnboarding.getUserId(), businessOnboarding.getBusinessId(), businessOnboarding.getAgreementAFEX(), (businessOnboarding.getAgreementAFEX() != 0));
        }
        Long oldInternationAgrement = old == null ? 0 : old.getNanopayInternationalPaymentsCustomerAgreement();
        if ( oldInternationAgrement != businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement() ) {
          AcceptanceDocumentService documentService = (AcceptanceDocumentService) x.get("acceptanceDocumentService");
          documentService.updateUserAcceptanceDocument(x, businessOnboarding.getUserId(), businessOnboarding.getBusinessId(), businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement(),
            businessOnboarding.getNanopayInternationalPaymentsCustomerAgreement() != 0 );
        }

        if ( businessOnboarding.getStatus() != net.nanopay.sme.onboarding.OnboardingStatus.SUBMITTED ) {
          return getDelegate().put_(x, businessOnboarding);
        }
  
        // TODO: Please call the java validator of the businessOnboarding here

        businessOnboarding.validate(x);

        FObject fObject = getDelegate().put_(x, businessOnboarding);

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);

        Business business = (Business)localBusinessDAO.find(businessOnboarding.getBusinessId());
        business = (Business) business.fclone();
        business.setBusinessRegistrationDate(businessOnboarding.getBusinessFormationDate());
        business.setCountryOfBusinessRegistration(businessOnboarding.getCountryOfBusinessFormation()); 
        localBusinessDAO.put(business);

        // Generate the notification sent to Fraud-ops & Payment-ops group only
        DAO localNotificationDAO = (DAO) x.get("localNotificationDAO");
        Notification notification = new Notification();
        notification.setBody("A Canadian business with name: " + business.getOrganization() + " and id: "
          + business.getId() + " has completed the cross-border onboarding.");
        notification.setNotificationType("A cross-border business has been onboarded");

        notification.setGroupId(business.getSpid() + "-fraud-ops");
        localNotificationDAO.put(notification);
        notification.setGroupId(business.getSpid() + "-payment-ops");
        localNotificationDAO.put(notification);

        return fObject;
      `
    }
  ]
});
