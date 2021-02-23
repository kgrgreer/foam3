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
    package: 'net.nanopay.meter',
    name: 'BusinessStatusContactDAO',
    extends: 'foam.dao.ProxyDAO',

    documentation: `Decorator DAO which set businessStatus property for 
      contact object. It is set to DISABLED if the referenced business 
      record could not be retrieved.`,

    imports: [
      'localBusinessDAO'
    ],

    javaImports: [
      'foam.core.FObject',
      'foam.dao.DAO',
      'foam.dao.ProxySink',
      'net.nanopay.admin.model.AccountStatus',
      'net.nanopay.contacts.Contact',
      'net.nanopay.model.Business'
    ],

    methods: [
        {
          name: 'find_',
          javaCode: `
            return fillBusinessStatus(x, super.find_(x, id));
          `
        },
        {
          name: 'select_',
          javaCode: `
            if (sink != null) {
              ProxySink decoratedSink = new ProxySink(x, sink) {
                @Override
                public void put(Object obj, foam.core.Detachable sub) {
                  FObject result = fillBusinessStatus(getX(), (FObject) obj);
                  super.put(result, sub);
                }
              };
              super.select_(x, decoratedSink, skip, limit, order, predicate);
              return sink;
            }
            return super.select_(x, sink, skip, limit, order, predicate);
          `
        },
        {
          name: 'fillBusinessStatus',
          type: 'foam.core.FObject',
          args: [
            { type: 'Context', name: 'x' },
            { type: 'foam.core.FObject', name: 'obj' }
          ],
          javaCode: `
            if ( ! ( obj instanceof Contact ) ) return obj;

            Contact result = (Contact) obj;
    
            if ( result != null
              && result.getBusinessId() != 0
            ) {
              result = (Contact) result.fclone();
              DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
              Business business = (Business) localBusinessDAO.inX(x).find(result.getBusinessId());
              result.setBusinessStatus(business != null
                ? business.getStatus()
                : AccountStatus.DISABLED);
            }
            return result;
          `
        }
      ]
  });
