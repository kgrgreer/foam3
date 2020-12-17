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
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOFieldPackager',
  abstract: true,

  documentation: 'Abstract implementation of ISOFieldPackager',

  implements: [
    'net.nanopay.iso8583.ISOFieldPackager'
  ],

  properties: [
    {
      class: 'Int',
      name: 'length'
    },
    {
      class: 'String',
      name: 'description'
    }
  ],

  methods: [
    {
      name: 'createComponent',
      javaCode: `
        return new ISOField.Builder(getX()).setFieldNumber(fieldNumber).build();
      `
    }
  ]
});
