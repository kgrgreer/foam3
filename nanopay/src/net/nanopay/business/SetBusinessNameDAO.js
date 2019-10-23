foam.CLASS({
  package: 'net.nanopay.business',
  name: 'SetBusinessNameDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A decorator to look up a business and set its name on another property.',

  imports: [
    'localBusinessDAO',
    'logger',
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
            String.format("%s/%s is not a property on %s.",
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
        getNameProperty().set(clone, business.label());
        return super.put_(x, clone);
      `
    }
  ]
});
