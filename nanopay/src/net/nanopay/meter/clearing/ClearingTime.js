foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTime',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'id',
    'description',
    'duration'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'objId'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      javaGetter: `
        if ( getOf() != null && ! SafetyUtil.isEmpty(getObjId()) ) {
          PropertyInfo idProp = (PropertyInfo) getOf().getAxiomByName("id");
          if ( idProp != null ) {
            return foam.mlang.MLang.EQ(
              idProp, idProp.getValueClass() == long.class
                ? Long.valueOf(getObjId())
                : getObjId()
            );
          }
        }

        return predicateIsSet_ ? predicate_ : foam.mlang.MLang.FALSE;
      `,
      visibilityExpression: function(of, objId) {
        return of === undefined || objId === ''
          ? foam.u2.Visibility.RW
          : foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2
    }
  ]
});
