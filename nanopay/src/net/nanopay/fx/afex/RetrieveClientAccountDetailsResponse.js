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
  package: 'net.nanopay.fx.afex',
  name: 'RetrieveClientAccountDetailsResponse',

  properties: [
    { class: 'String', name: 'accountEntityType' },
    { class: 'String', name: 'accountNumber' },
    { class: 'String', name: 'accountStatus' },
    { class: 'String', name: 'businessAddress' },
    { class: 'String', name: 'businessCity' },
    { class: 'String', name: 'businessCountry' },
    { class: 'String', name: 'businessState' },
    { class: 'String', name: 'businessTelephoneNo' },
    { class: 'String', name: 'businessWebsite' },
    { class: 'String', name: 'businessZip' },
    { class: 'String', name: 'citizenship' },
    { class: 'String', name: 'companyRegistrationNo' },
    { class: 'String', name: 'companyType' },
    { class: 'String', name: 'contactAddress1' },
    { class: 'String', name: 'contactAddress2' },
    { class: 'String', name: 'contactAddress3' },
    { class: 'String', name: 'contactCity' },
    { class: 'String', name: 'contactCountryCode' },
    { class: 'String', name: 'contactPhone' },
    { class: 'String', name: 'contactPrimaryIdentificationIssuingAgency' },
    { class: 'String', name: 'contactPrimaryIdentificationExpirationDate' },
    { class: 'String', name: 'contactPrimaryIdentificationNumber' },
    { class: 'String', name: 'contactPrimaryIdentificationType' },
    { class: 'String', name: 'contactStateRegion' },
    { class: 'String', name: 'contactZip' },
    { class: 'String', name: 'correspondenceAddress' },
    { class: 'String', name: 'correspondenceCity' },
    { class: 'String', name: 'correspondenceCountry' },
    { class: 'String', name: 'correspondenceState' },
    { class: 'String', name: 'correspondenceZip' },
    { class: 'String', name: 'countryOfIncorporation' },
    { class: 'String', name: 'dateOfBirth' },
    { class: 'String', name: 'dateOfFormation' },
    { class: 'String', name: 'description' },
    { class: 'String', name: 'descriptionOfBusiness' },
    { class: 'String', name: 'doingBusinessAs' },
    { class: 'String', name: 'employmentStatus' },
    { class: 'String', name: 'expectedMonthlyPayments' },
    { class: 'String', name: 'expectedMonthlyVolume' },
    { class: 'String', name: 'federalTaxId' },
    { class: 'String', name: 'firstName' },
    { class: 'String', name: 'jobTitle' },
    { class: 'String', name: 'keyIndividuals' },
    { class: 'String', name: 'lastName' },
    { class: 'String', name: 'legalCompanyName' },
    { class: 'String', name: 'LEIExpirationDate' },
    { class: 'String', name: 'LEINumber' },
    { class: 'String', name: 'middleName' },
    { class: 'String', name: 'NAICS' },
    { class: 'String', name: 'occupation' },
    { class: 'String', name: 'primaryEmailAddress' },
    { class: 'String', name: 'salutation' },
    { class: 'String', name: 'secondaryIdentificationExpirationDate' },
    { class: 'String', name: 'secondaryIdentificationIssuingAgency' },
    { class: 'String', name: 'secondaryIdentificationNumber' },
    { class: 'String', name: 'secondaryIdentificationType' },
    { class: 'StringArray', name: 'sourcesOfWealth' },
    { class: 'String', name: 'stateRegionOfIncorporation' },
    { class: 'String', name: 'taxIdentificationNumber' },
    { class: 'Boolean', name: 'termsAndConditions' },
    { class: 'String', name: 'tickerSymbol' },
    { class: 'StringArray', name: 'tradingCountries' }
  ]
});
