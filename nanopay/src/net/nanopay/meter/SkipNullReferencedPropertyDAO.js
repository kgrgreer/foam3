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
  name: 'SkipNullReferencedPropertyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator which skips object if a specified referenced property on the object returns null.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.lang.reflect.Method',
    'org.apache.commons.lang3.StringUtils',
  ],

  properties: [
    {
      name: 'property',
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink decoratedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject result = read(getX(), (FObject) obj);
              if ( result != null ) {
                super.put(result, sub);
              }
            }
          };
          super.select_(x, decoratedSink, skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      type: 'foam.core.FObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        if ( obj != null
          && ! SafetyUtil.equals(getProperty().get(obj), 0)
          && invokePropertyFinder(x, obj) == null
        ) {
            return null;
        }
        return obj;
      `
    },
    {
      name: 'invokePropertyFinder',
      type: 'foam.core.FObject',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        try {
          Method method = obj.getClass().getMethod(
            "find" + StringUtils.capitalize(getProperty().getName()), foam.core.X.class);
          return (FObject) method.invoke(obj, x);
        } catch (Exception e) {
          ((Logger) x.get("logger")).error(
            String.format(
              "Error invoking finder method on referenced property(%s).", getProperty().toString())
            , e);
        }
        return null;
      `
    }
  ]
});
