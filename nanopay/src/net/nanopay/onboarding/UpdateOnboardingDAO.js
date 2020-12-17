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
  name: 'UpdateOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    DAO decorator to update related BusinessOnboarding and USBusinessOnboarding
    records of the business.
 
    When a signing officer submits business onboarding, the status of related
    onboardings of the other users belong to the same business will be updated
    to SUBMITTED.
 
    Otherwise (eg. when onboarding is SAVED or in DRAFT), no change to the
    related onboardings should be triggered.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.onboarding.USBusinessOnboarding',
    
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'NULL_BUSINESS_ERROR_MSG', message: 'Cannot put null' },
    { name: 'BUSINESS_NOT_EXIST_ERROR_MSG', message: 'Business doesn\'t exist' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public UpdateOnboardingDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
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
        if ( obj == null ) {
          throw new RuntimeException(NULL_BUSINESS_ERROR_MSG);
        }
    
        long businessId = (long) obj.getProperty("businessId");
        var localBusinessDAO  = (DAO) x.get("localBusinessDAO");
        var business = (Business) localBusinessDAO.find(businessId);
    
        if ( business == null ) {
          throw new RuntimeException(BUSINESS_NOT_EXIST_ERROR_MSG);
        }
    
        long userId = (long) obj.getProperty("userId");
        var sink = new ArraySink();
    
        selectBusinessOnboarding(x, sink, businessId, userId);
        selectUsBusinessOnboarding(x, sink, businessId, userId);
    
        for ( var onboarding : sink.getArray() ) {
          var updated = maybeUpdate((FObject) onboarding, obj);
          if ( ! updated.equals(onboarding) ) {
            getDelegate().put_(x, updated);
          }
        }
    
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'selectBusinessOnboarding',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Sink', name: 'sink' },
        { type: 'long', name: 'businessId' },
        { type: 'long', name: 'userId' }
      ],
      javaCode: `
        var dao = (DAO) x.get("businessOnboardingDAO");
        dao.where(
          AND(
            EQ(BusinessOnboarding.BUSINESS_ID, businessId),
            NEQ(BusinessOnboarding.USER_ID, userId)
          )
        ).select(sink);
      `
    },
    {
      name: 'selectUsBusinessOnboarding',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Sink', name: 'sink' },
        { type: 'long', name: 'businessId' },
        { type: 'long', name: 'userId' }
      ],
      javaCode: `
        var dao = (DAO) x.get("uSBusinessOnboardingDAO");
        dao.where(
          AND(
            EQ(USBusinessOnboarding.BUSINESS_ID, businessId),
            NEQ(USBusinessOnboarding.USER_ID, userId)
          )
        ).select(sink);
      `
    },
    {
      name: 'maybeUpdate',
      visibility: 'protected',
      type: 'FObject',
      args: [
        { type: 'FObject', name: 'obj' },
        { type: 'FObject', name: 'newObj' }
      ],
      javaCode: `
        var newStatus = (OnboardingStatus) newObj.getProperty("status");
        if ( newStatus != OnboardingStatus.SUBMITTED ) {
          return obj;
        }

        var updated             = (FObject) newObj.fclone();
        var isSigningOfficer    = (boolean) obj.getProperty("signingOfficer");
        var signingOfficerEmail = isSigningOfficer ? null :
          (String) obj.getProperty("signingOfficerEmail");

        updated.setProperty("userId", obj.getProperty("userId"));
        updated.setProperty("signingOfficer", isSigningOfficer);
        updated.setProperty("signingOfficerEmail", signingOfficerEmail);
        return updated;
      `
    }
  ]
});
