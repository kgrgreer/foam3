// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.kotak.model",
	name: "Amount_ST",
	extends: "foam.core.Float",
	properties: [
		{
			class: "String",
			name: "pattern",
			value: "^\\\\d{0,16}(\\\\.\\\\d{1,4})?$"
		},
		{
			class: "String",
			name: "minExclusive",
			value: "0.0"
		},
		{
			name: "assertValue",
			value: function (value, prop) {
          if ( ( prop.minInclusive || prop.minInclusive === 0 ) && value < prop.minInclusive )
            throw new Error(prop.name);
          if ( ( prop.minExclusive || prop.minExclusive === 0 ) && value <= prop.minExclusive )
            throw new Error(prop.name);
          if ( ( prop.maxInclusive || prop.maxInclusive === 0 ) && value > prop.maxInclusive )
            throw new Error(prop.name);
          if ( ( prop.maxExclusive || prop.maxExclusive === 0 ) && value >= prop.maxExclusive )
            throw new Error(prop.name);

          if ( prop.totalDigits || prop.fractionDigits ) {
            var str = value + '';
            var length = str.length;
            var hasDecimal = str.indexOf('.') !== -1;

            if ( prop.totalDigits ) {
              if ( hasDecimal ) length -= 1;
              if ( length > prop.totalDigits )
                throw new Error(prop.name);
            }

            if ( prop.fractionDigits && hasDecimal ) {
              var decimals = str.split('.')[1];
              if ( decimals.length > prop.fractionDigits )
                throw new Error(prop.name);
            }

          }
        }
		},
		{
			name: "javaAssertValue",
			factory: function () {
          var toReturn = ``;

          if ( this.minInclusive || this.minInclusive === 0 ) {
            toReturn +=
`if ( val < ` + this.minInclusive + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }

          if ( this.minExclusive || this.minExclusive === 0 ) {
            toReturn +=
`if ( val <= ` + this.minInclusive + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }

          if ( this.maxInclusive || this.maxInclusive === 0 ) {
            toReturn +=
`if ( val > ` + this.maxInclusive + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }

          if ( this.maxExclusive || this.maxExclusive === 0 ) {
            toReturn +=
`if ( val >= ` + this.maxExclusive + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }


          if ( this.totalDigits || this.fractionDigits ) {
            toReturn +=
`String str = Double.toString(val);
int length = str.length();
boolean hasDecimal = str.contains(".");\n`

            if ( this.totalDigits ) {
              toReturn +=
`if ( hasDecimal ) length -= 1;
if ( length > ` + this.totalDigits + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`
            }

            if ( this.fractionDigits ) {
              toReturn +=
`if ( hasDecimal ) {
  String decimals = str.split("\\\\.")[1];
  if ( decimals.length() > ` + this.fractionDigits + ` ) {
    throw new IllegalArgumentException("${this.name}");
  }
}\n`
            }
          }

          return toReturn;
        }
		}
	]
});