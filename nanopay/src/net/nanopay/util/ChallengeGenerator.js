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