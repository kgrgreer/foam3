/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'ArrayConstant',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable'],

  properties: [
    {
      class: 'Array',
      name: 'value'
    }
  ],

  javaImports: [ 'java.util.Arrays' ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
  @Override
  protected StringBuilder initialValue() {
    return new StringBuilder();
  }

  @Override
  public StringBuilder get() {
    StringBuilder b = super.get();
    b.setLength(0);
    return b;
  }
};`
        }))
      }
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() { return this.value; },
      swiftCode: 'return value',
      javaCode: 'return getValue();',
    },
    {
      name: 'createStatement',
      javaCode: 'return " ? "; '
    },
    {
      name: 'prepareStatement',
      javaCode:
`Object[] obj = getValue();
if ( obj == null ) {
  stmt.setObject(null);
  return;
}
int length = obj.length;
if ( length == 0 ) {
  stmt.setObject(null);
  return;
}
StringBuilder builder = sb.get();
for ( int i = 0; i < length; i++ ) {
  if ( obj[i] == null )
    builder.append("");
  else
    escapeCommasAndAppend(builder, obj[i]);
  if ( i < length - 1 ) {
    builder.append(",");
  }
}
stmt.setObject(builder.toString());`
    },
    {
      name: 'escapeCommasAndAppend',
      args: [
        {
          name: 'builder',
          javaType: 'StringBuilder'
        },
        {
          name: 'o',
          type: 'Any'
        }
      ],
      type: 'Void',
      javaCode:
`String s = o.toString();
//replace backslash to double backslash
s = s.replace("\\\\", "\\\\\\\\");
//replace comma to backslash+comma
s = s.replace(",", "\\\\,");
builder.append(s);
`
    },
    {
      name: 'toString',
      code: function() {
        return Array.isArray(this.value) ? '[' + this.value.map(this.toString_.bind(this)).join(', ') + ']' :
          this.value.toString ? this.value.toString :
          x;
      },
      javaCode: `
        return Arrays.toString(getValue());
      `
    }
  ]
});
