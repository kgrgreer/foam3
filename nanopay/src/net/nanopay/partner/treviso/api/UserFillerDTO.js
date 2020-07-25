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
  package: 'net.nanopay.partner.treviso.api',
  name: 'UserFillerDTO',

  properties: [
    {
      class: 'String',
      name: 'usrNm',
      shortName: 'usrNm',
      documentation: 'Name of user filling form'
    },
    {
      class: 'String',
      name: 'usrLogn',
      shortName: 'usrLogn'
    },
    {
      class: 'String',
      name: 'email',
      shortName: 'email'
    },
    {
      class: 'String',
      name: 'cpfCnpjNif',
      shortName: 'cpfCnpjNif'
    },
    {
      class: 'String',
      name: 'usrPhon',
      shortName: 'usrPhon'
    },
    {
      class: 'String',
      name: 'dflt_lang',
      shortName: 'dflt_lang',
      documentation: 'Language used for notification by email / SMS and on the platform when the user filling in the system.'
    },
    {
      class: 'String',
      name: 'entNm',
      shortName: 'entNm',
      documentation: 'Name of the potential prospectus.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.BusinessUnit',
      name: 'businessUnitDTO',
      shortName: 'businessUnitDTO'
    },
    {
      class: 'String',
      name: 'entEmail',
      shortName: 'entEmail'
    },
    {
      class: 'String',
      name: 'entCpfCnpjNr',
      shortName: 'entCpfCnpjNr'
    },
    {
      class: 'String',
      name: 'entCellphoneNr',
      shortName: 'entCellphoneNr'
    },
    {
      class: 'String',
      name: 'prsnTyp',
      shortName: 'prsnTyp',
      value: 'J'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.RmUser',
      name: 'rmUser',
      shortName: 'rmUser',
      documentation: 'Backoffice user that will be RM user'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.partner.treviso.api.FormParameter',
      name: 'formParameters',
      shortName: 'formParameters'
    }
  ]
});
