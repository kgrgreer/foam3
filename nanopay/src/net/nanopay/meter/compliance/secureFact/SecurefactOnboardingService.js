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
   package: 'net.nanopay.meter.compliance.secureFact',
   name: 'SecurefactOnboardingService',

   documentation: `Securefact service for business onboarding via FlinksLoginId object.`,

   javaImports: [
     'foam.core.FObject',
     'foam.nanos.crunch.connection.CapabilityPayload',
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.logger.Logger',
     'java.util.ArrayList',
     'java.util.HashMap',
     'java.util.List',
     'java.util.Map',
     'net.nanopay.crunch.registration.BusinessDirectorList',
     'net.nanopay.crunch.registration.BusinessOwnerList',
     'net.nanopay.crunch.registration.SigningOfficerList',
     'net.nanopay.flinks.external.FlinksLoginId',
     'net.nanopay.meter.compliance.secureFact.SecurefactService',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentParty',
     'net.nanopay.model.BeneficialOwner',
     'net.nanopay.model.Business',
     'net.nanopay.model.BusinessDirector'
   ],

   methods: [
     {
       name: 'onboardLEVParties',
       type: 'java.util.Map',
       args: [
         {
           name: 'x',
           type: 'Context'
         },
         {
           name: 'flinksLoginId',
           type: 'net.nanopay.flinks.external.FlinksLoginId'
         }
       ],
       javaCode: `
        DAO capabilityPayloadDAO = (DAO) x.get("capabilityPayloadDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        Business business = flinksLoginId.findBusiness(x);
        Map<String,FObject> partiesCapabilityDataObjects = new HashMap<>();
        Map<String,FObject> directorsCapabilityDataObjects = new HashMap<>();
        Map<String,FObject> officersCapabilityDataObjects = new HashMap<>();
        Map<String,FObject> ownersCapabilityDataObjects = new HashMap<>();

        if ( business == null ) {
          throw new RuntimeException("SecurefactOnboardingService: Business is null from flinksLoginId object.");
        }

        try {
          LEVResponse response = securefactService.levSearch(x, business);
          LEVResult[] results = response.getResults();
          LEVResult chosenResult = null;
          for ( int i = 0; i < results.length; i++ ) {
            LEVResult result = results[i];
            if ( result.getCloseMatch() == true ) {
              chosenResult = result;
              break;
            }
          }

          if ( chosenResult != null ) {
            LEVDocumentOrderResponse orderResponse = securefactService.levDocumentOrder(x, chosenResult.getResultId());
            LEVDocumentDataResponse dataResponse = securefactService.levDocumentData(x, orderResponse.getOrderId());
            LEVDocumentParty[] parties = dataResponse.getParties();

            List<BusinessDirector> directorsList = new ArrayList<>();
            ArrayList<Long> officerIdList = new ArrayList<>();
            List<BeneficialOwner> ownersList = new ArrayList<>();
            for ( int i = 0; i < parties.length; i++ ) {
              LEVDocumentParty party = parties[i];
              if ( party.getDesignation().equals("Director") ) {
                BusinessDirector businessDirector = new BusinessDirector.Builder(x)
                  .setType(party.getType())
                  .setFirstName(party.getFirstName())
                  .setLastName(party.getLastName())
                  .build();
                directorsList.add(businessDirector);
              } else if ( party.getDesignation().equals("Officer") ) {
                User signingOfficer = new User.Builder(x)
                  .setFirstName(party.getFirstName())
                  .setLastName(party.getLastName())
                  .build();
                signingOfficer = (User) userDAO.put(signingOfficer);
                officerIdList.add(signingOfficer.getId());
              } else if ( party.getDesignation().equals("Shareholder") ) {
                BeneficialOwner owner = new BeneficialOwner.Builder(x)
                  .setFirstName(party.getFirstName())
                  .setLastName(party.getLastName())
                  .build();
                ownersList.add(owner);
              }
            }

            BusinessDirector[] businessDirectorsArray = new BusinessDirector[directorsList.size()];
            businessDirectorsArray = directorsList.toArray(businessDirectorsArray);
            BusinessDirectorList businessDirectorList = new BusinessDirectorList.Builder(x)
              .setBusiness(business.getId())
              .setBusinessDirectors(businessDirectorsArray)
              .build();

            SigningOfficerList signingOfficerList = new SigningOfficerList.Builder(x)
              .setBusiness(business.getId())
              .setSigningOfficers(officerIdList)
              .build();
            
            BeneficialOwner[] ownersArray = new BeneficialOwner[ownersList.size()];
            ownersArray = ownersList.toArray(ownersArray);
            BusinessOwnerList beneficialOwnerList = new BusinessOwnerList.Builder(x)
              .setBusiness(business.getId())
              .setBusinessOwners(ownersArray)
              .build();

            directorsCapabilityDataObjects.put("Business Directors", businessDirectorList);
            CapabilityPayload businessDirectorsCapPayload = new CapabilityPayload.Builder(x)
              .setId("F1359801-7D71-4F30-8D36-531B4A674981")
              .setCapabilityDataObjects(directorsCapabilityDataObjects)
              .build();
            
            officersCapabilityDataObjects.put("Signing Officers", signingOfficerList);
            CapabilityPayload signingOfficersCapPayload = new CapabilityPayload.Builder(x)
              .setId("A285FDFA-3C6B-4150-A0F4-B72E664A3A9E")
              .setCapabilityDataObjects(officersCapabilityDataObjects)
              .build();

            ownersCapabilityDataObjects.put("Business Owners", beneficialOwnerList);
            CapabilityPayload businessOwnersCapPayload = new CapabilityPayload.Builder(x)
              .setId("6DD8D005-7514-432D-BC32-9C5D569A0462")
              .setCapabilityDataObjects(ownersCapabilityDataObjects)
              .build();

            capabilityPayloadDAO.inX(x).put(businessDirectorsCapPayload);
            capabilityPayloadDAO.inX(x).put(signingOfficersCapPayload);
            capabilityPayloadDAO.inX(x).put(businessOwnersCapPayload);

            partiesCapabilityDataObjects.put("Business Directors", businessDirectorList);
            partiesCapabilityDataObjects.put("Signing Officers", signingOfficerList);
            partiesCapabilityDataObjects.put("Business Owners", beneficialOwnerList);
          }
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("SecurefactOnboardingService failed.", e);
        }
        
        return partiesCapabilityDataObjects;
       `
     }
   ]
 });
