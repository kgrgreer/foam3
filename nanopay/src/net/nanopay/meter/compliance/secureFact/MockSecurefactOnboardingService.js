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
   name: 'MockSecurefactOnboardingService',
   implements: [ 'net.nanopay.meter.compliance.secureFact.SecurefactOnboardingService' ],

   documentation: `Securefact service for filling business onboarding details.`,

   javaImports: [
     'foam.core.FObject',
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User',
     'foam.nanos.dig.exception.ExternalAPIException',
     'foam.nanos.logger.Logger',
     'foam.util.SafetyUtil',
     'java.util.ArrayList',
     'java.util.HashMap',
     'java.util.List',
     'java.util.Map',
     'net.nanopay.crunch.registration.BusinessDirectorList',
     'net.nanopay.crunch.registration.BusinessOwnerList',
     'net.nanopay.crunch.registration.SigningOfficerList',
     'net.nanopay.crunch.registration.businesstypes.CorporationData',
     'net.nanopay.model.BeneficialOwner',
     'net.nanopay.model.Business',
     'net.nanopay.model.BusinessDirector',
     'net.nanopay.model.SigningOfficer',
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
          // For corporations, director and owner information must be collected
          CorporationData corporationData = new CorporationData.Builder(x).setSelected(true).build();
          corporationData.setBusinessTypeId(corporationData.getBusinessTypeId());
          partiesCapabilityDataObjects.put("Corporation Business Type", corporationData);

          // Process the parties
          List<SigningOfficer> officerList = new ArrayList<>();
          SigningOfficer signingOfficer = new SigningOfficer.Builder(x)
                  .setFirstName("Signing")
                  .setLastName("Officer")
                  .setPosition("CEO")
                  .setSource("SECURE_FACT")
                  .build();
          officerList.add(signingOfficer);

          List<BeneficialOwner> ownersList = new ArrayList<>();
          BeneficialOwner owner = new BeneficialOwner.Builder(x)
                  .setFirstName("Beneficial")
                  .setLastName("Owner")
                  .setJobTitle("CTO")
                  .setShowValidation(false) // prevent validation on the benefial owner for now
                  .build();
          ownersList.add(owner);

          List<BusinessDirector> directorsList = new ArrayList<>();
          BusinessDirector businessDirector = new BusinessDirector.Builder(x)
                  .setFirstName("Business")
                  .setLastName("Director")
                  .build();
          directorsList.add(businessDirector);

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
          ((Logger) x.get("logger")).warning("MockSecurefactOnboardingService failed.", e);
        }
       `
     }
   ]
 });
