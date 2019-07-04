// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PhoneNumber",
	documentation: `The collection of information which identifies a specific phone or FAX number as defined by telecom services.
It consists of a "+" followed by the country code (from 1 to 3 characters) then a "-" and finally, any combination of numbers, "(", ")", "+" and "-" (up to 30 characters).`,
	extends: "foam.core.String",
	properties: [
		{
			class: "String",
			name: "pattern",
			value: "^\\\\+[0-9]{1,3}-[0-9()+\\\\-]{1,30}$"
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