// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AnyBICIdentifier",
	documentation: "Code allocated to a financial or non-financial institution by the ISO 9362 Registration Authority, as described in ISO 9362 \"Banking - Banking telecommunication messages - Business identifier code (BIC)\".",
	extends: "foam.core.String",
	properties: [
		{
			class: "String",
			name: "pattern",
			value: "^[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}$"
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