foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InterestRate',

  properties: [
  {
class: 'Long',
  name: 'id'
  },
  {
  documentation:'The interest rate applicable to the loan',
class: 'Double',
  name: 'rate'
  },
  {
  documentation:'spid that this interest rate belongs to',
class: 'String',
  name: 'spid'
  },
  {
  documentation:'The minimum loan amount this interest rate applies to',
class: 'Currency',
  name: 'minAmount'
  },
  {
  documentation:'The maximum loan amount this interest rate applies to',
class: 'Currency',
  name: 'maxAmount'
  },
  {
  documentation:'The minimum loan period this interest rate applies to',
class: 'Long',
  name: 'minPeriod'
  },
  {
  documentation:'The maximum loan period this interest rate applies to',
class: 'Long',
  name: 'maxPeriod'
  }
  ]
  });
