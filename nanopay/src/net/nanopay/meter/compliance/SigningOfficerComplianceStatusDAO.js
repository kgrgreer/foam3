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
  package: 'net.nanopay.meter.compliance',
  name: 'SigningOfficerComplianceStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Decorating DAO populating compliance property on signing officer model
    i.e., BusinessUserJunction.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.User',
    'net.nanopay.model.BusinessUserJunction',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if ( obj != null ) {
          obj = populateComplianceStatus(x, obj);
        }
        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new SigningOfficerComplianceStatusSink(x, sink, this);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'populateComplianceStatus',
      type: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        BusinessUserJunction junction = (BusinessUserJunction) obj.fclone();
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User signingOfficer = (User) localUserDAO.find(junction.getTargetId());

        if ( signingOfficer != null ) {
          junction.setCompliance(signingOfficer.getCompliance());
        }
        return junction;
      `
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'SigningOfficerComplianceStatusSink',
  extends: 'foam.dao.ProxySink',

  javaImports: [
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        obj = dao_.populateComplianceStatus(getX(), (FObject) obj);
        getDelegate().put(obj, sub);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private SigningOfficerComplianceStatusDAO dao_;

          public SigningOfficerComplianceStatusSink(foam.core.X x, foam.dao.Sink delegate, SigningOfficerComplianceStatusDAO dao) {
            super(x, delegate);
            dao_ = dao;
          }
        `);
      }
    }
  ]
});
