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
  package: "net.nanopay.fx.afex",
  name: "AddCompanyOfficerRequest",
  properties: [
    {
      class: 'String',
      name: "ApiKey"
    },
    {
      class: 'String',
      name: "FirstName"
    },
    {
      class: 'String',
      name: "LastName"
    },    
    {
      class: 'String',
      name: "PercentOwnership"
    },
    {
      class: "String",
      name: "Director"
    },
    {
      class: 'String',
      name: "DateOfBirth"
    },
    {
      class: "String",
      name: "Address1"
    },
    {
      class: "String",
      name: "City"
    },
    {
      class: "String",
      name: "CountryCode"
    },
    {
      class: "String",
      name: "StateRegion"
    },
    {
      class: "String",
      name: "Zip"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationIssuingType"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationNumber"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationIssuingAgency"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationIssuingCountry"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationIssuingRegion"
    },
    {
      class: "String",
      name: "CompanyOfficerIdentificationExpirationDate"
    },
    {
      class: "String",
      name: "CompanyOfficerTaxIdentificationNumber"
    },
  ]
});