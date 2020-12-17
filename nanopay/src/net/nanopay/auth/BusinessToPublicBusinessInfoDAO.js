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
  package: 'net.nanopay.auth',
  name: 'BusinessToPublicBusinessInfoDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `
    Decorates a DAO of Businesses and converts them to PublicBusinessInfos on
    read. Extends ReadOnlyDAO.
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'foam.nanos.auth.LifecycleState',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Business business = (Business) super.find_(x, id);

        if ( business == null ) return null;

        return new PublicBusinessInfo(x, business);
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            Business business = (Business) o;
            if ( isPublic(x, business) ) {
              PublicBusinessInfo bInfo = new PublicBusinessInfo(x, business);
              getDelegate().put(bInfo, d);
            }
          }
        };

        getDelegate().select_(x, proxy, skip, limit, order, predicate);

        // Return the proxy's delegate - the caller may explicitly be expecting
        // this array sink they passed.  See foam.dao.RequestResponseClientDAO
        return proxy.getDelegate();
      `
    },
    {
      name: 'isPublic',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'business', type: 'net.nanopay.model.Business' }
      ],
      javaCode: `
        return business != null &&
          SafetyUtil.equals(business.getLifecycleState(), LifecycleState.ACTIVE) &&
          SafetyUtil.equals(business.getCompliance(), ComplianceStatus.PASSED) &&
          SafetyUtil.equals(business.getOnboarded(), true) &&
          business.getIsPublic();
      `
    }
  ]
});
