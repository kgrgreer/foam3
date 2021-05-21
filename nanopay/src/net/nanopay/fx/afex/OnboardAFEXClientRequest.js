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
  package: "net.nanopay.fx.afex",
  name: "OnboardAFEXClientRequest",

  documentation: `
    Model of the request parameters used in the AFEX accountcreate api.
    All properties are in Uppercase to match the sample request from AFEX.
  `,

  properties: [
    {
      class: 'String',
      name: 'TermsAndConditions',
      description: 'Accept AFEX terms and conditions?'
    },
    {
      class: 'String',
      name: 'AccountEntityType',
      description: 'Entity Type of an account that is going to be onboarded'
    },
    {
      class: 'String',
      name: 'AccountNumber',
      description: 'Used to retrieve and update account information'
    },
    {
      class: 'String',
      name: 'Salutation',
      description: 'Greeting for communication'
    },
    {
      class: 'String',
      name: 'FirstName',
      description: 'First Name of the individual'
    },
    {
      class: 'String',
      name: 'MiddleName',
      description: 'Middle Name of the individual'
    },
    {
      class: 'String',
      name: 'LastName',
      description: 'Last Name of the inidividual'
    },
    {
      class: 'String',
      name: 'Citizenship',
      description: 'Citizenship of the individual'
    },
    {
      class: 'String',
      name: 'ContactAddress1',
      description: 'Contact primary location - Address line 1'
    },
    {
      class: 'String',
      name: 'ContactAddress2',
      description: 'Contact primary location - Address line 2'
    },
    {
      class: 'String',
      name: 'ContactAddress3',
      description: 'Contact primary location - Address line 3'
    },
    {
      class: 'String',
      name: 'ContactZip',
      description: 'Contact primary location - Zip Code / Post Code'
    },
    {
      class: 'String',
      name: 'ContactCity',
      description: 'Contact primary location - City'
    },
    {
      class: 'String',
      name: 'ContactStateRegion',
      description: 'Contact primary location - State / Region'
    },
    {
      class: 'String',
      name: 'ContactCountryCode',
      description: 'Contact primary location - Country'
    },
    {
      class: 'String',
      name: 'ContactPhone',
      description: 'Individual phone number'
    },
    {
      class: 'String',
      name: 'ContactPrimaryIdentificationExpirationDate',
      description: 'Individual primary identification expiration date'
    },
    {
      class: 'String',
      name: 'ContactPrimaryIdentificationIssuingAgency',
      description: 'Individual primary identification issuing agency'
    },
    {
      class: 'String',
      name: 'ContactPrimaryIdentificationNumber',
      description: 'Individual primary identification number'
    },
    {
      class: 'String',
      name: 'ContactPrimaryIdentificationType',
      description: 'Individual primary identification type'
    },
    {
      class: 'String',
      name: 'DateOfBirth',
      description: 'Individual date of birth'
    },
    {
      class: 'String',
      name: 'EmploymentStatus',
      description: 'Individual employment status'
    },
    {
      class: 'String',
      name: 'JobTitle',
      description: `Individual job title for private user or individual with the company`
    },
    {
      class: 'String',
      name: 'JobTitleOther',
      description: 'Description of the job title if unable to locate a value in the job title field '
    },
    {
      class: 'String',
      name: 'Occupation',
      description: 'Individual occupation'
    },
    {
      class: 'String',
      name: 'PrimaryEmailAddress',
      description: 'Individual primary email address'
    },
    {
      class: 'String',
      name: 'SecondaryIdentificationExpirationDate',
      description: 'Individual secondary identification expiration date'
    },
    {
      class: 'String',
      name: 'SecondaryIdentificationIssuingAgency',
      description: 'Individual secondary identification issuing agency'
    },
    {
      class: 'String',
      name: 'SecondaryIdentificationNumber',
      description: 'Individual secondary identification number'
    },
    {
      class: 'String',
      name: 'SecondaryIdentificationType',
      description: 'Individual secondary identification type'
    },
    {
      class: 'StringArray',
      name: 'SourcesOfWealth',
      description: 'Individual sources of wealth'
    },
    {
      class: 'String',
      name: 'TaxIdentificationNumber',
      description: 'Individual tax identification number'
    },
    {
      class: 'String',
      name: 'LegalCompanyName',
      description: 'Business legal entity name'
    },
    {
      class: 'String',
      name: 'DoingBusinessAs',
      description: 'Business Name'
    },
    {
      class: 'String',
      name: 'BusinessTelephoneNo',
      description: 'Registered business phone number'
    },
    {
      class: 'String',
      name: 'BusinessWebsite',
      description: 'Registered business website'
    },
    {
      class: 'String',
      name: 'CompanyType',
      description: 'Type of company'
    },
    {
      class: 'String',
      name: 'DescriptionOfBusiness',
      description: 'Definition of business'
    },
    {
      class: 'String',
      name: 'DateOfFormation',
      description: 'Effective date of the original Certificate of Formation of the company'
    },
    {
      class: 'String',
      name: 'CountryOfIncorporation',
      description: 'The country in which the company is incorporated or legally registered'
    },
    {
      class: 'String',
      name: 'StateRegionOfIncorporation',
      description: 'The state/region in which the company is incorporated or legally registered'
    },
    {
      class: 'String',
      name: 'FederalTaxId',
      description: 'IRS unique identifier for a business entity (i.e. Employer Identification Number - EIN)'
    },
    {
      class: 'String',
      name: 'CompanyRegistrationNumber',
      description: 'Unique identifier issued by government commission when a company is incorporated'
    },
    {
      class: 'String',
      name: 'CompanyRegistrationNo',
      description: 'Unique identifier issued by government commission when a company is incorporated'
    },
    {
      class: 'String',
      name: 'BusinessCountry',
      description: 'Country the business resides within'
    },
    {
      class: 'String',
      name: 'BusinessAddress',
      description: 'Local business address'
    },
    {
      class: 'String',
      name: 'BusinessCity',
      description: 'Local business city'
    },
    {
      class: 'String',
      name: 'BusinessState',
      description: 'Local business state / region'
    },
    {
      class: 'String',
      name: 'BusinessZip',
      description: 'Local business zip / postcode'
    },
    {
      class: 'String',
      name: 'CorrespondanceCountry',
      description: 'Miscellaneous correspondance with business from particular country'
    },
    {
      class: 'String',
      name: 'CorrespondanceAddress',
      description: 'Miscellaneous correspondance with business from particular address'
    },
    {
      class: 'String',
      name: 'CorrespondanceCity',
      description: 'Miscellaneous correspondance with business from particular city'
    },
    {
      class: 'String',
      name: 'CorrespondanceState',
      description: 'Miscellaneous correspondance with business from particular state / region'
    },
    {
      class: 'String',
      name: 'CorrespondanceZip',
      description: 'Miscellaneous correspondance with business from particular zip / postcode'
    },
    {
      class: 'String',
      name: 'NAICS',
      description: 'NAICS industry code'
    },
    {
      class: 'String',
      name: 'TTickerSymbol',
      description: 'Stock Exchange Symbol'
    },
    {
      class: 'String',
      name: 'Description',
      description: 'additional information to describe the account'
    },
    {
      class: 'String',
      name: 'ExpectedMonthlyPayments',
      description: 'Expected number of recurring monthly payments'
    },
    {
      class: 'String',
      name: 'ExpectedMonthlyVolume',
      description: 'Expected volume of recurring monthly payments'
    },
    {
      class: 'String',
      name: 'LEINumber',
      description: 'Legal Entity Identifier'
    },
    {
      class: 'String',
      name: 'LEIExpirationDate',
      description: 'Legal Entity Identifier expiration date'
    },
    {
      class: 'StringArray',
      name: 'TradingCountries',
      description: 'Expected trading countries'
    },
    {
      class: "FObjectArray",
      name: "KeyIndividuals",
      documentation: "An array of signing officers.",
      of: "net.nanopay.fx.afex.KeyIndividual",
    },
    {
      class: 'String',
      name: 'IndividualRoles',
      description: 'What is this individual\'s roles in the company?'
    },
    {
      class: 'String',
      name: 'PercentOwnership',
      description: 'Individual\'s percentage of ownership of the company'
    },
    {
      class: 'String',
      name: 'Address',
      description: 'Residential address of the individual'
    },
    {
      class: 'String',
      name: 'City',
      description: 'Residential city of the individual'
    },
    {
      class: 'String',
      name: 'Zip',
      description: 'Residential zip / postcode of the individual'
    },
    {
      class: 'String',
      name: 'Email',
      description: 'Email of the individual'
    },
    {
      class: 'String',
      name: 'PhoneNumber',
      description: 'Phone number of the individual'
    },
    {
      class: 'String',
      name: 'SSN',
      description: 'Social security number of the individual'
    },
    {
      class: 'String',
      name: 'IDType',
      description: 'Type of identification of the individual'
    },
    {
      class: 'String',
      name: 'IDNo',
      description: 'Number of identification of the individual'
    },
    {
      class: 'String',
      name: 'IDExpirationDate',
      description: 'Expiration date of identification'
    },
    {
      class: 'String',
      name: 'IssueJurisdiction',
      description: 'Authority that granted the identification'
    },
    {
      class: 'String',
      name: 'AccountPrimaryContact',
      description: 'Is this individual the primary contact for the account?'
    },
    {
      class: 'String',
      name: 'AFEXDirectUserRole',
      description: 'What is the AFEXDirect User Role of the individual?'
    },
    {
      class: 'String',
      name: 'State',
      description: 'Residential state / region of the individual'
    },
    {
      class: 'String',
      name: 'Country',
      description: 'Residential country of the individual'
    }
  ]
})
