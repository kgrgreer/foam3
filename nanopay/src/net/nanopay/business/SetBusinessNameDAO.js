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
  package: 'net.nanopay.business',
  name: 'SetBusinessNameDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A decorator to look up a business and set its name on another property.',

  imports: [
    'DAO localBusinessDAO',
    'Logger logger',
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'referenceProperty',
      documentation: 'The property that references a Business.'
    },
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'nameProperty',
      documentation: `The property that will be set to the business's name.`
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        List axioms = obj.getClassInfo().getAxioms();
        if ( ! axioms.contains(getReferenceProperty())
          || ! axioms.contains(getNameProperty())
        ) {
          ((Logger) getLogger()).debug(
            String.format("%s/%s property pair on %s is missing.",
              getReferenceProperty().getName(),
              getNameProperty().getName(),
              obj.getClass().getCanonicalName())
          );
          return super.put_(x, obj);
        }

        long businessId = (long) getReferenceProperty().get(obj);
        String name = (String) getNameProperty().get(obj);

        if ( businessId == 0 || ! SafetyUtil.isEmpty(name) ) return super.put_(x, obj);

        Business business = (Business) ((DAO) getLocalBusinessDAO()).inX(x).find(businessId);

        if ( business == null ) {
          ((Logger) getLogger()).warning(String.format("Business with id=%d not found.", businessId));
          return super.put_(x, obj);
        }

        FObject clone = (FObject) obj.fclone();
        getNameProperty().set(clone, business.toSummary());
        return super.put_(x, clone);
      `
    }
  ]
});
