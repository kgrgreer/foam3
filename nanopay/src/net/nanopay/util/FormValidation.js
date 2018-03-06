foam.CLASS({
  package: 'net.nanopay.util',
  name: 'FormValidation',

  exports: [
    'validateName',
    'validateEmail',
    'validatePostalCode',
    'validatePhone',
    'validateCity',
    'validateStreetNumber',
    'validateStreetName',
    'validateAddressLine',
    'validatePassword',
    'validateWebsite',
    'validateRegNumber'
  ],

  methods: [
    function validateName(name) {
      var re = /^[a-zA-Z ]{1,70}$/;
      return re.test(String(name));
    },
    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    function validatePhone(number) {
      var re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      return re.test(String(number));
    },
    function validateStreetNumber(streetNumber) {
      var re = /^[0-9]{1,16}$/;
      return re.test(String(streetNumber));
    },
    function validateStreetName(streetName) {
      var re = /^[a-zA-Z0-9 ]{1,70}$/;
      return re.test(String(streetName));
    },
    function validateAddressLine(addressLine) {
      var re = /^[a-zA-Z0-9 ]{1,70}$/;
      return re.test(String(addressLine));
    },
    function validatePostalCode(code) {
      var re = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      return re.test(String(code));
    },
    function validateCity(city) {
      var re = /^[a-zA-Z ]{1,35}$/;
      return re.test(String(city));
    },
    function validatePassword(password) {
      var re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{7,32}$/;
      return re.test(String(password));
    },
    function validateWebsite(website) {
      var re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
      return re.test(String(website));
    },
    function validateRegNumber(registrationNumber) {
      var re = /^[a-zA-Z0-9 ]{1,35}$/;
      return re.test(String(registrationNumber));
    }
  ]
});
