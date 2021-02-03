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
  `,

  properties: [
    {
      class: 'String',
      name: 'termsAndConditions',
      description: 'Accept AFEX terms and conditions?'
    },
    {
      class: 'String',
      name: 'accountEntityType',
      description: 'Entity Type of an account that is going to be onboarded'
    },
    {
      class: 'String',
      name: 'accountNumber',
      description: 'Used to retrieve and update account information'
    },
    {
      class: 'String',
      name: 'salutation',
      description: 'Greeting for communication'
    },
    {
      class: 'String',
      name: 'firstName',
      description: 'First Name of the individual'
    },
    {
      class: 'String',
      name: 'middleName',
      description: 'Middle Name of the individual'
    },
    {
      class: 'String',
      name: 'lastName',
      description: 'Last Name of the inidividual'
    },
    {
      class: 'String',
      name: 'citizenship',
      description: 'Citizenship of the individual'
    },
    {
      class: 'String',
      name: 'contactAddress1',
      description: 'Contact primary location - Address line 1'
    },
    {
      class: 'String',
      name: 'contactAddress2',
      description: 'Contact primary location - Address line 2'
    },
    {
      class: 'String',
      name: 'contactAddress3',
      description: 'Contact primary location - Address line 3'
    },
    {
      class: 'String',
      name: 'contactZip',
      description: 'Contact primary location - Zip Code / Post Code'
    },
    {
      class: 'String',
      name: 'contactCity',
      description: 'Contact primary location - City'
    },
    {
      class: 'String',
      name: 'contactStateRegion',
      description: 'Contact primary location - State / Region'
    },
    {
      class: 'String',
      name: 'contactCountryCode',
      description: 'Contact primary location - Country'
    },
    {
      class: 'String',
      name: 'contactPhone',
      description: 'Individual phone number'
    },
    {
      class: 'String',
      name: 'contactPrimaryIdentificationExpirationDate',
      description: 'Individual primary identification expiration date'
    },
    {
      class: 'String',
      name: 'contactPrimaryIdentificationIssuingAgency',
      description: 'Individual primary identification issuing agency'
    },
    {
      class: 'String',
      name: 'contactPrimaryIdentificationNumber',
      description: 'Individual primary identification number'
    },
    {
      class: 'String',
      name: 'contactPrimaryIdentificationType',
      description: 'Individual primary identification type'
    },
    {
      class: 'String',
      name: 'dateOfBirth',
      description: 'Individual date of birth'
    },
    {
      class: 'String',
      name: 'employmentStatus',
      description: 'Individual employment status'
    },
    {
      class: 'String',
      name: 'jobTitle',
      description: `Individual job title for private user or individual with the company`
    },
    {
      class: 'String',
      name: 'jobTitleOther',
      description: 'Description of the job title if unable to locate a value in the job title field '
    },
    {
      class: 'String',
      name: 'occupation',
      description: 'Individual occupation'
    },
    {
      class: 'String',
      name: 'primaryEmailAddress',
      description: 'Individual primary email address'
    },
    {
      class: 'String',
      name: 'secondaryIdentificationExpirationDate',
      description: 'Individual secondary identification expiration date'
    },
    {
      class: 'String',
      name: 'secondaryIdentificationIssuingAgency',
      description: 'Individual secondary identification issuing agency'
    },
    {
      class: 'String',
      name: 'secondaryIdentificationNumber',
      description: 'Individual secondary identification number'
    },
    {
      class: 'String',
      name: 'secondaryIdentificationType',
      description: 'Individual secondary identification type'
    },
    {
      class: 'StringArray',
      name: 'sourcesOfWealth',
      description: 'Individual sources of wealth'
    },
    {
      class: 'String',
      name: 'taxIdentificationNumber',
      description: 'Individual tax identification number'
    },
    {
      class: 'String',
      name: 'legalCompanyName',
      description: 'Business legal entity name'
    },
    {
      class: 'String',
      name: 'doingBusinessAs',
      description: 'Business Name'
    },
    {
      class: 'String',
      name: 'businessTelephoneNo',
      description: 'Registered business phone number'
    },
    {
      class: 'String',
      name: 'businessWebsite',
      description: 'Registered business website'
    },
    {
      class: 'String',
      name: 'companyType',
      description: 'Type of company'
    },
    {
      class: 'String',
      name: 'descriptionOfBusiness',
      description: 'Definition of business'
    },
    {
      class: 'String',
      name: 'dateOfFormation',
      description: 'Effective date of the original Certificate of Formation of the company'
    },
    {
      class: 'String',
      name: 'countryOfIncorporation',
      description: 'The country in which the company is incorporated or legally registered'
    },
    {
      class: 'String',
      name: 'stateRegionOfIncorporation',
      description: 'The state/region in which the company is incorporated or legally registered'
    },
    {
      class: 'String',
      name: 'federalTaxId',
      description: 'IRS unique identifier for a business entity (i.e. Employer Identification Number - EIN)'
    },
    {
      class: 'String',
      name: 'companyRegistrationNumber',
      description: 'Unique identifier issued by government commission when a company is incorporated'
    },
    {
      class: 'String',
      name: 'businessCountry',
      description: 'Country the business resides within'
    },
    {
      class: 'String',
      name: 'businessAddress',
      description: 'Local business address'
    },
    {
      class: 'String',
      name: 'businessCity',
      description: 'Local business city'
    },
    {
      class: 'String',
      name: 'businessState',
      description: 'Local business state / region'
    },
    {
      class: 'String',
      name: 'businessZip',
      description: 'Local business zip / postcode'
    },
    {
      class: 'String',
      name: 'correspondanceCountry',
      description: 'Miscellaneous correspondance with business from particular country'
    },
    {
      class: 'String',
      name: 'correspondanceAddress',
      description: 'Miscellaneous correspondance with business from particular address'
    },
    {
      class: 'String',
      name: 'correspondanceCity',
      description: 'Miscellaneous correspondance with business from particular city'
    },
    {
      class: 'String',
      name: 'correspondanceState',
      description: 'Miscellaneous correspondance with business from particular state / region'
    },
    {
      class: 'String',
      name: 'correspondanceZip',
      description: 'Miscellaneous correspondance with business from particular zip / postcode'
    },
    {
      class: 'String',
      name: 'NAICS',
      description: 'NAICS industry code'
    },
    {
      class: 'String',
      name: 'tickerSymbol',
      description: 'Stock Exchange Symbol'
    },
    {
      class: 'String',
      name: 'description',
      description: 'additional information to describe the account'
    },
    {
      class: 'String',
      name: 'expectedMonthlyPayments',
      description: 'Expected number of recurring monthly payments'
    },
    {
      class: 'String',
      name: 'expectedMonthlyVolume',
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
      name: 'tradingCountries',
      description: 'Expected trading countries'
    },
		{
			class: "FObjectArray",
			name: "keyIndividuals",
			documentation: "An array of signing officers.",
			of: "net.nanopay.fx.afex.KeyIndividual",
		},
    {
      class: 'String',
      name: 'individualRoles',
      description: 'What is this individual\'s roles in the company?'
    },
    {
      class: 'String',
      name: 'percentOwnership',
      description: 'Individual\'s percentage of ownership of the company'
    },
    {
      class: 'String',
      name: 'address',
      description: 'Residential address of the individual'
    },
    {
      class: 'String',
      name: 'city',
      description: 'Residential city of the individual'
    },
    {
      class: 'String',
      name: 'zip',
      description: 'Residential zip / postcode of the individual'
    },
    {
      class: 'String',
      name: 'email',
      description: 'Email of the individual'
    },
    {
      class: 'String',
      name: 'phoneNumber',
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
      name: 'issueJurisdiction',
      description: 'Authority that granted the identification'
    },
    {
      class: 'String',
      name: 'accountPrimaryContact',
      description: 'Is this individual the primary contact for the account?'
    },
    {
      class: 'String',
      name: 'AFEXDirectUserRole',
      description: 'What is the AFEXDirect User Role of the individual?'
    },
    {
      class: 'String',
      name: 'state',
      description: 'Residential state / region of the individual'
    },
    {
      class: 'String',
      name: 'country',
      description: 'Residential country of the individual'
    }
  ]
})
