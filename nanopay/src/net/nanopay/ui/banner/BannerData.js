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
  package: 'net.nanopay.ui.banner',
  name: 'BannerData',
  documentation: 'Data for banner display',

  properties: [
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'Boolean',
      name: 'isDismissed',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDismissable',
      value: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.ui.banner.BannerMode',
      name: 'mode'
    }
  ]
});

foam.ENUM({
  package: 'net.nanopay.ui.banner',
  name: 'BannerMode',

  documentation: 'Mode that determines banner color',

  values: [
    { name: 'ALERT', label: 'Alert' },
    { name: 'NOTICE', label: 'Notice' },
    { name: 'ACCOMPLISHED', label: 'Accomplished' }
  ]
});
