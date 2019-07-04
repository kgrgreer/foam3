foam.CLASS({
  package: 'net.nanopay.util',
  name: 'ChallengeGenerator',

  exports: [ 'generateChallenge' ],

  methods: [
    /**
     * Generates a random 8 character hex string to be used as a transaction challenge
     **/
    function generateChallenge() {
      return ('00000000' + Math.floor(Math.random() * (4294967295 - 1) + 1).toString(16).toUpperCase()).slice(-8);
    }
  ]
});