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
  name: 'DocumentImage',

  properties: [
    {
      class: 'String',
      name: 'dcmntLawNm',
      shortName: 'dcmnt_law_nm',
      documentation: 'Name of the image associated with the document'
    },
    {
      class: 'String',
      name: 'dcmntLawImgTyp',
      shortName: 'dcmnt_law_img_typ',
      documentation: 'Type of image associated with the document. PNG, JPG'
    },
    {
      class: 'String',
      name: 'dcmntLawImgBase64',
      shortName: 'dcmntLawImgBase64',
      documentation: 'Image string associated with the document. '
    },
  ]
});
