/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
   name: 'ServerSecurefactOnboardingService',
   implements: [ 'net.nanopay.meter.compliance.secureFact.SecurefactOnboardingService' ],

   documentation: `Securefact service for filling business onboarding details.`,

   javaImports: [
     'foam.core.FObject',
     'foam.dao.ArraySink',
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.crunch.Capability',
     'foam.nanos.crunch.CapabilityCapabilityJunction',
     'foam.nanos.crunch.CrunchService',
     'foam.nanos.dig.exception.TemporaryExternalAPIException',
     'foam.nanos.logger.Logger',
     'foam.util.SafetyUtil',
     'java.util.ArrayList',
     'java.util.HashMap',
     'java.util.List',
     'java.util.Map',
     'net.nanopay.crunch.registration.BusinessDirectorList',
     'net.nanopay.crunch.registration.BusinessOwnerList',
     'net.nanopay.crunch.registration.SigningOfficerList',
     'net.nanopay.crunch.registration.businesstypes.BusinessTypeData',
     'net.nanopay.crunch.registration.businesstypes.SoleProprietorData',
     'net.nanopay.crunch.registration.businesstypes.PartnershipData',
     'net.nanopay.crunch.registration.businesstypes.CorporationData',
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
     'static foam.mlang.MLang.*'
   ],

   classes: [
    {
      name: 'BusinessTypeDescriptor',
      documentation: `Holds business type information for setting capability payloads.`,

      properties: [
        {
          class: 'FObjectProperty',
          name: 'businessTypeData',
          of: 'net.nanopay.crunch.registration.businesstypes.BusinessTypeData'
        },
        {
          class: 'FObjectProperty',
          name: 'capability',
          of: 'foam.nanos.crunch.Capability'
        },
        {
          class: 'Boolean',
          name: 'hasPrerequisites'
        }
      ]
    }
  ],

   methods: [
      {
       name: 'retrieveLEVCapabilityPayloads',
       args: [
         { name: 'x', type: 'Context' },
         { name: 'business', type: 'net.nanopay.model.Business' },
         { name: 'partiesCapabilityDataObjects', type: 'java.util.Map' }
       ],
       javaCode: `
        try {
          LEVResult chosenResult = retrieveChosenBusiness(x, business);
          
          // Check if any results were chosen
          if ( chosenResult == null ) {
            return;
          }

          // Get the business type
          BusinessTypeDescriptor businessTypeDescriptor = retrieveBusinessType(x, chosenResult.getNormalizedEntityType());
          partiesCapabilityDataObjects.put(businessTypeDescriptor.getCapability().getName(), businessTypeDescriptor.getBusinessTypeData());
          if ( !businessTypeDescriptor.getHasPrerequisites() ) 
            return;

          // Retrieve document data
          LEVDocumentDataResponse dataResponse = retrieveDocumentData(x, chosenResult, business);

          // Process the parties
          LEVDocumentParty[] parties = dataResponse.getParties();
          List<SigningOfficer> officerList = new ArrayList<>();
          List<BeneficialOwner> ownersList = new ArrayList<>();
          List<BusinessDirector> directorsList = new ArrayList<>();
          if ( parties != null && parties.length > 0 ) {
            for ( int i = 0; i < parties.length; i++ ) {
              LEVDocumentParty party = parties[i];

              String firstName = party.getFirstName();
              String lastName = party.getLastName();

              if ( SafetyUtil.isEmpty(firstName) || SafetyUtil.isEmpty(lastName) ) {
                String fullName = party.getFullName();
                if ( ! SafetyUtil.isEmpty(fullName) ) {
                  String nameSplit[] = fullName.split(" ", 2);
                  if ( nameSplit.length > 0 ) firstName = nameSplit[0];
                  if ( nameSplit.length > 1 ) lastName = nameSplit[1];
                }
              }
              
              if ( party.getDesignation().equals("Director") ) {
                BusinessDirector businessDirector = new BusinessDirector.Builder(x)
                  .setFirstName(firstName)
                  .setLastName(lastName)
                  .build();
                directorsList.add(businessDirector);
              } else if ( party.getDesignation().equals("Officer") ) {
                SigningOfficer signingOfficer = new SigningOfficer.Builder(x)
                  .setFirstName(firstName)
                  .setLastName(lastName)
                  .setPosition(party.getPosition())
                  .setSource("SECURE_FACT")
                  .build();
                officerList.add(signingOfficer);
              } else if ( party.getDesignation().equals("Shareholder") ) {
                BeneficialOwner owner = new BeneficialOwner.Builder(x)
                  .setFirstName(firstName)
                  .setLastName(lastName)
                  .setJobTitle(party.getPosition())
                  .setShowValidation(false) // prevent validation on the benefial owner for now
                  .build();
                ownersList.add(owner);
              }
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
       `
     },
     {
      name: 'retrieveChosenBusiness',
      type: 'LEVResult',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'business', type: 'net.nanopay.model.Business' }
      ],
      javaCode: `
        if ( business == null ) {
          throw new RuntimeException("Business is required for LEV document retrieval.");
        }

        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        LEVResponse response = securefactService.levSearch(x, business);
        LEVResult[] results = response.getResults();
        for ( int i = 0; i < results.length; i++ ) {
          LEVResult result = results[i];
          if ( result.getCloseMatch() == true ) {
            return result;
          }
        }

        return null;
      `
    },
    {
      name: 'retrieveBusinessType',
      type: 'BusinessTypeDescriptor',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'normalizedEntityType', type: 'String' }
      ],
      javaCode: `
        // Get the business type
        if ( SafetyUtil.isEmpty(normalizedEntityType) ) {
          throw new RuntimeException("Business type cannot be determined. LEV normalized entity type not supplied");
        }

        BusinessTypeData businessTypeData;
        String capabilityId;

        if ( SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship") ||
             SafetyUtil.equals(normalizedEntityType, "Trade Name") ||
             SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship/Trade Name") ||
             SafetyUtil.equals(normalizedEntityType, "Sole Proprietorship/Partnership") ) {
          businessTypeData = new SoleProprietorData.Builder(x)
            .setSelected(true)
            .build();
          capabilityId = "business-type-sole-proprietorship";
        }
        else if ( SafetyUtil.equals(normalizedEntityType, "Partnership") ||
                  SafetyUtil.equals(normalizedEntityType, "Partnership/Sole Proprietorship/Trade Name") ) {
          businessTypeData = new PartnershipData.Builder(x)
            .setSelected(true)
            .build();
          capabilityId = "business-type-partnership";
        }
        else if ( SafetyUtil.equals(normalizedEntityType, "Corporation") )
        {
          businessTypeData = new CorporationData.Builder(x)
            .setSelected(true)
            .build();
          capabilityId = "business-type-corporation";
        }
        else {
          throw new RuntimeException("Unexpected normalized entity type from LEV: " + normalizedEntityType);
        }

        // Set the business type so that it is copied over in the copyFrom method which requires the property to be set and not the default value
        businessTypeData.setBusinessTypeId(businessTypeData.getBusinessTypeId());

        Capability capability = (Capability) ((DAO) x.get("capabilityDAO")).find(capabilityId);
        if ( capability == null ) {
          throw new RuntimeException("Capability for business type cannot be found");
        }

        List<String> prerequisites = ((CrunchService) x.get("crunchService")).getPrereqs(x, capability.getId(), null);
        Boolean hasPrerequisites = prerequisites.size() > 0;

        return new BusinessTypeDescriptor.Builder(x)
              .setBusinessTypeData(businessTypeData)
              .setCapability(capability)
              .setHasPrerequisites(hasPrerequisites)
              .build();
      `
    },
    {
      name: 'retrieveDocumentData',
      type: 'LEVDocumentDataResponse',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'chosenResult', type: 'LEVResult' },
        { name: 'business', type: 'net.nanopay.model.Business' }
      ],
      javaThrows: [
        'InterruptedException'
      ],
      javaCode: `
        // Create a document order
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        LEVDocumentOrderResponse orderResponse = securefactService.levDocumentOrder(x, chosenResult.getResultId());
        
        // Timeout after 30 minutes
        final long startTime = System.currentTimeMillis();
        final long DOCUMENT_DATA_TIMEOUT = (30 * 60 * 1000); // 30 minutes
        final long SLEEP_TIME = 1000; // 1 second

        // Retrieve document data
        LEVDocumentDataResponse dataResponse = null;
        do {
          if ( dataResponse != null ) {
            Thread.sleep(SLEEP_TIME);
          }
          dataResponse = securefactService.levDocumentData(x, orderResponse.getOrderId());

          if ( System.currentTimeMillis() - startTime > DOCUMENT_DATA_TIMEOUT ) {
            throw new TemporaryExternalAPIException("Timeout retrieving party data for " + business.getBusinessName());
          }
        } while ( dataResponse != null && SafetyUtil.equals(dataResponse.getStatus(), "In Progress") );
        
        if ( SafetyUtil.equals(dataResponse.getStatus(), "Cancelled") ) {
          throw new TemporaryExternalAPIException("Company data failed document lookup for " + business.getBusinessName());
        }

        return dataResponse;
      `
    }
   ]
 });
