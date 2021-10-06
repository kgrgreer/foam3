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
  package: 'foam.net.ip',
  name: 'FetchIPAddressInfo',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `
    Fetches IP Address Info from provider defined on the IP Address Info object.
  `,

  javaImports: [
    'foam.net.ip.IPAddressInfo',
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.nanos.auth.Subject',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if ( obj == null ) {
          return obj;
        }
        IPAddressInfo ipInfo = (IPAddressInfo) obj.fclone();
        return fetch(ipInfo);
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            IPAddressInfo ipInfo = (IPAddressInfo) fetch((IPAddressInfo) o);
            getDelegate().put(ipInfo, d);
          }
        };
        getDelegate().select_(x, proxy, skip, limit, order, predicate);
        return proxy.getDelegate();
      `
    },
    {
      name: 'fetch',
      type: 'foam.net.ip.IPAddressInfo',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ipInfo', type: 'foam.net.ip.IPAddressInfo' }
      ],
      javaCode: `

        return ipInfo;
      `
    }
  ]
});
