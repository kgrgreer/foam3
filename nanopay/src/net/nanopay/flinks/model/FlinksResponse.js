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

//instance create when HttpStatusCode is not 200, contain all invalid login info
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksResponse',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  documentation: 'model for Flinks Response',

  properties: [
    {
      class: 'Int',
      name: 'HttpStatusCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'FlinksCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'Message',
      visibility: 'RO'
    },
    {
      type: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'Links',
      visibility: 'RO'
    },
    {
      class: 'Map',
      name: 'ValidationDetails',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'RequestId',
      visibility: 'RO'
    },
    {
      //type: 'net.nanopay.flinks.model.LoginModel',
      //javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      //javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.LoginModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.LoginModel',
      name: 'Login',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'created'
    }
  ]
});
