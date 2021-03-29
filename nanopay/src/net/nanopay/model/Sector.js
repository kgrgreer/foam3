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
  package: 'net.nanopay.model',
  name: 'Sector',
  documentation: 'businessSector class of https://servicodados.ibge.gov.br/api/v2/cnae/classes',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'descricao',
      documentation: 'name of businessSector'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Grupo',
      name: 'grupo',
      documentation: 'businessSector group'
    }
  ],
});
