foam.CLASS({
  package: 'net.nanopay.util',
  name: 'FormValidation',

  exports: [
    'validateEmail',
    'validatePostalCode',
    'validatePhone',
    'validateStrStrong',
    'validateStrMedium',
    'validateAge'
  ],

  methods: [
    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    function validatePostalCode(code){
      var re = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
      return re.test(String(code));
    },
    function validatePhone(number){
      var re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      return re.test(String(number));
    },
    // *** Strong *** At least 1 lowercase, 1 uppercase, 1 numeric, 1 special character, 8 characters or longer.
    function validateStrStrong(str){
      var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      return re.test(String(str));
    },
    // *** Medium *** 6 characters or more, 1 lowercase and 1 uppercase alphabetical character or has at least 1 lowercase and 1 numeric character or has at least 1 uppercase and 1 numeric character.
    function validateStrMedium(str){
      var re =  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
      return re.test(String(str));
    },

    function validateAge(date) {
      var year = date.getFullYear();
      var currentYear = new Date().getFullYear();
      return currentYear - year >= 16;
    }
  ]
});
