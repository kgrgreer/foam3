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

   documentation: `Securefact service for filling business onboarding details.`,

   javaImports: [
     'foam.core.FObject',
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.logger.Logger',
     'foam.util.SafetyUtil',
     'java.util.ArrayList',
     'java.util.HashMap',
     'java.util.List',
     'java.util.Map',
     'net.nanopay.crunch.registration.BusinessDirectorList',
     'net.nanopay.crunch.registration.BusinessOwnerList',
     'net.nanopay.crunch.registration.BusinessTypeData',
     'net.nanopay.crunch.registration.SigningOfficerList',
     'net.nanopay.meter.compliance.secureFact.SecurefactService',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
     'net.nanopay.meter.compliance.secureFact.lev.LEVResult',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentDataResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentOrderResponse',
     'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentParty',
     'net.nanopay.model.BeneficialOwner',
     'net.nanopay.model.Business',
     'net.nanopay.model.BusinessDirector',
     'net.nanopay.model.SigningOfficer',
   ],

   methods: [
     {
       name: 'retrieveLEVCapabilityPayloads',
       type: 'java.util.Map',
       args: [
         {
           name: 'x',
           type: 'Context'
         },
         {
           name: 'business',
           type: 'net.nanopay.model.Business'
         }
       ],
       javaCode: `
        Map<String,FObject> partiesCapabilityDataObjects = new HashMap<>();
        
        if ( business == null ) {
          throw new RuntimeException("Business is required for LEV document retrieval.");
        }

        try {
          SecurefactService securefactService = (SecurefactService) x.get("securefactService");
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

          // Check if any results were chosen
          if ( chosenResult == null ) {
            return partiesCapabilityDataObjects;
          }

          // Get the business type
          String normalizedEntityType = chosenResult.getNormalizedEntityType();
          if ( SafetyUtil.isEmpty(normalizedEntityType) ) {
            throw new RuntimeException("Business type cannot be determined. LEV normalized entity type not supplied");
          }

          int businessTypeId = 0;
          if ( SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship") ||
               SafetyUtil.equals(normalizedEntityType, "Trade Name") ||
               SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship/Trade Name") ||
               SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship/Partnership") ) {
            businessTypeId = 1;
          }
          else if ( SafetyUtil.equals(normalizedEntityType, "Partnership") ||
                    SafetyUtil.equals(normalizedEntityType, "Partnership/Sole Proprietorship/Trade Name") ) {
            businessTypeId = 2;
          }
          else if ( SafetyUtil.equals(normalizedEntityType, "Corporation") )
          {
            businessTypeId = 3;
          }
          else {
            throw new RuntimeException("Unexpected normalized entity type from LEV: " + normalizedEntityType);
          }
          BusinessTypeData businessTypeData = new BusinessTypeData.Builder(x)
            .setBusinessTypeId(businessTypeId)
            .build();
          partiesCapabilityDataObjects.put("Business Type", businessTypeData);
          
          // Only need to collect more information when the business is a corporation
          if ( businessTypeId != 3 ) {
            partiesCapabilityDataObjects.put("Extra Business Type Data Not Required", null);
            return partiesCapabilityDataObjects;
          }

          // For corporations, director and owner information must be collected
          partiesCapabilityDataObjects.put("Extra Business Type Data Required", null);

          // Create a document order
          LEVDocumentOrderResponse orderResponse = securefactService.levDocumentOrder(x, chosenResult.getResultId());
          
          // Retrieve document data
          LEVDocumentDataResponse dataResponse = null;
          do {
            if ( dataResponse != null ) {
              Thread.sleep(1000);
            }
            dataResponse = securefactService.levDocumentData(x, orderResponse.getOrderId());

            // TODO: add timeout after 2-5 minutes?
          } while ( dataResponse != null && dataResponse.getStatus() == "In Progress" );
          
          if ( SafetyUtil.equals(dataResponse.getStatus(), "Cancelled") ) {
            throw new RuntimeException("Company data failed LEV document lookup");
          }

          // Process the parties
          LEVDocumentParty[] parties = dataResponse.getParties();
          if ( parties == null || parties.length == 0 ) {
            return partiesCapabilityDataObjects;
          }

          List<SigningOfficer> officerList = new ArrayList<>();
          List<BeneficialOwner> ownersList = new ArrayList<>();
          List<BusinessDirector> directorsList = new ArrayList<>();
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
              SigningOfficer signingOfficer = new SigningOfficer.Builder(x)
                .setFirstName(party.getFirstName())
                .setLastName(party.getLastName())
                .setPosition(party.getPosition())
                .build();
              officerList.add(signingOfficer);
            } else if ( party.getDesignation().equals("Shareholder") ) {
              BeneficialOwner owner = new BeneficialOwner.Builder(x)
                .setFirstName(party.getFirstName())
                .setLastName(party.getLastName())
                .setJobTitle(party.getPosition())
                .setShowValidation(false) // prevent validation on the benefial owner for now
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
          
          BeneficialOwner[] ownersArray = new BeneficialOwner[ownersList.size()];
          ownersArray = ownersList.toArray(ownersArray);
          BusinessOwnerList beneficialOwnerList = new BusinessOwnerList.Builder(x)
            .setBusiness(business.getId())
            .setBusinessOwners(ownersArray)
            .build();

          SigningOfficer[] signingOfficersArray = new SigningOfficer[officerList.size()];
          signingOfficersArray = officerList.toArray(signingOfficersArray);
          SigningOfficerList signingOfficerList = new SigningOfficerList.Builder(x)
            .setBusiness(business.getId())
            .setSigningOfficers(signingOfficersArray)
            .build();

          partiesCapabilityDataObjects.put("Business Directors", businessDirectorList);
          partiesCapabilityDataObjects.put("Business Owners", beneficialOwnerList);
          partiesCapabilityDataObjects.put("Signing Officers", signingOfficerList);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("SecurefactOnboardingService failed.", e);
        }
        
        return partiesCapabilityDataObjects;
       `
     }
   ]
 });
