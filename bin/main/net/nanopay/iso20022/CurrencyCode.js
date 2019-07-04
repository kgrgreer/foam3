// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CurrencyCode",
	documentation: "Code allocated to a currency, by a maintenance agency, under an international identification scheme as described in the latest edition of the international standard ISO 4217 \"Codes for the representation of currencies and funds\". Valid currency codes are registered with the ISO 4217 Maintenance Agency, and consist of three contiguous letters.",
	extends: "foam.core.String",
	properties: [
		{
			class: "String",
			name: "pattern",
			value: "^[A-Z]{3,3}$"
		},
		{
			name: "assertValue",
			value: function (value, prop) {
          if ( ( prop.minLength || prop.minLength === 0 ) && value.length < prop.minLength )
            throw new Error(prop.name);
          if ( ( prop.maxLength || prop.maxLength === 0 ) && value.length > prop.maxLength )
            throw new Error(prop.name);
          if ( prop.pattern && ! new RegExp(prop.pattern, 'g').test(value) )
            throw new Error(prop.name);
        }
		},
		{
			name: "javaAssertValue",
			factory: function () {
          var toReturn = ``;

          if ( this.minLength || this.minLength === 0 ) {
            toReturn +=
`if ( val.length() < ` + this.minLength + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }

          if ( this.maxLength || this.maxLength === 0 ) {
            toReturn +=
`if ( val.length() > ` + this.maxLength + ` ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }

          if ( this.pattern ) {
            toReturn +=
`java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("${this.pattern}");
if ( ! pattern.matcher(val).matches() ) {
  throw new IllegalArgumentException("${this.name}");
}\n`;
          }
          return toReturn;
        }
		}
	]
});