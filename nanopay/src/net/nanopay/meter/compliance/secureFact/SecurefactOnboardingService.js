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
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.logger.Logger',
     'java.util.ArrayList',
     'java.util.HashMap',
     'java.util.List',
     'java.util.Map',
     'net.nanopay.crunch.onboardingModels.BusinessDirectorsData',
     'net.nanopay.flinks.external.FlinksLoginId',
     'net.nanopay.meter.compliance.secureFact.SecurefactService',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentParty',
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
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        Business business = flinksLoginId.findBusiness(x);
        Map<String,FObject> partiesCapabilityDataObjects = new HashMap<>();

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

            for ( int i = 0; i < parties.length; i++ ) {
              LEVDocumentParty party = parties[i];
              List<BusinessDirector> businessDirectorList = new ArrayList<>();
              if ( party.getDesignation().equals("Director") ) {
                BusinessDirector businessDirector = new BusinessDirector.Builder(x)
                  .setType(party.getType())
                  .setFirstName(party.getFirstName())
                  .setLastName(party.getLastName())
                  .build();
                businessDirectorList.add(businessDirector);
              }
              BusinessDirector[] businessDirectorsArray = new BusinessDirector[businessDirectorList.size()];
              businessDirectorsArray = businessDirectorList.toArray(businessDirectorsArray);
              BusinessDirectorsData businessDirectorsData = new BusinessDirectorsData.Builder(x)
                .setBusinessDirectors(businessDirectorsArray)
                .build();
              partiesCapabilityDataObjects.put("Business Directors Data", businessDirectorsData);
              
            }
            // create capabilities, sort parties based on type, (directors/owners)
          }
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("SecurefactOnboardingService failed.", e);
        }
        
        return partiesCapabilityDataObjects;
       `
     }
   ]
 });
