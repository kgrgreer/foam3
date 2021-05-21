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
  package: 'net.nanopay.meter.compliance.secureFact.lev.document',
  name: 'LEVDocumentParty',
  documentation: 'The parties (for example Directors, Officers, Shareholders or Partners)',

  properties: [
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of party (Individual, Entity or Unknown)'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The first name of the party.'
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The middle name of the party.'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'The last name of the party.'
    },
    {
      class: 'String',
      name: 'fullName',
      documentation: 'The full name of the party.'
    },
    {
      class: 'String',
      name: 'designation',
      documentation: `The role that the party has within the entity.
                      Examples: (Officer, Director, Shareholder, Partner, Sole Proprietor)`
    },
    {
      class: 'String',
      name: 'position',
      documentation: `The specific officer position (President, VP-Finance, etc.) 
                      if the party has a designation of Officer.`
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVEntityAddress',
      name: 'addresses',
      documentation: 'The addresses of the party as reflected on the profile.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVDocumentPartyShareClass',
      name: 'shareClass',
      documentation: 'Describes the shares held by the party, if the designation is Shareholder.'
    }
  ]
});
