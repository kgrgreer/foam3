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
  name: 'GetDocumentTypeResponse',

  properties: [
    {
      class: 'Int',
      name: 'idDcmntTyp'
    },
    {
      class: 'String',
      name: 'dcmntTypNm',
      documentation: 'Document Type Name'
    },
    {
      class: 'String',
      name: 'dcmntTypStus',
      shortName: 'dcmnt_typ_stus',
      documentation: 'A: Active, I: Inactive'
    },
    {
      class: 'String',
      name: 'extCode',
      shortName: 'ext_code'
    },
    {
      class: 'Boolean',
      name: 'idntfctnDcmntTyp',
      shortName: 'idntfctnDcmntTyp'
    },
    {
      class: 'String',
      name: 'creatnDt',
      shortName: 'creatn_dt',
      documentation: 'Creation date'
    }
  ]
});
