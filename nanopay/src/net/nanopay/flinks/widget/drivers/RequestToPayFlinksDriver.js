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
  package: 'net.nanopay.flinks.widget.drivers',
  name: 'RequestToPayFlinksDriver',
  extends: 'net.nanopay.flinks.widget.drivers.FlinksDriver',

  javaImports: [
    'foam.core.*',
    'foam.dao.DAO',
    'net.nanopay.rtp.RequestToPay',
    'net.nanopay.flinks.external.OnboardingType',
    'net.nanopay.flinks.external.FlinksLoginId',
    'net.nanopay.flinks.widget.FlinksException'
  ],

  properties: [
    {
      name: 'dao',
      class: 'String'
    },
    {
      name: 'id',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [ 
        { name: 'x', type: 'X' }
      ],
      javaCode: `
        DAO requestToPayDAO = (DAO) x.get(getDao());
        RequestToPay requestToPay = (RequestToPay) requestToPayDAO.find(getId());
        if ( requestToPay == null ) {
          throw new FlinksException("No request to pay found for id: " + getId());
        }

        FlinksLoginId onboardingRequest = new FlinksLoginId.Builder(x)
          .setLoginId(getLoginId())
          .setAccountId(getAccountId())
          .setInstitution(getInstitution())
          .setType(OnboardingType.DEFAULT)
          .build();

        // Elevate to system here to complete onboarding
        DAO onboardingDao = (DAO) x.get("flinksLoginIdDAO");
        onboardingRequest = (FlinksLoginId) onboardingDao.put(onboardingRequest);

        // Link the onboading request to the request to pay
        requestToPay.setOnboardingRequest(onboardingRequest.getId());
        requestToPayDAO.put(requestToPay);
      `
    }
  ]
});
