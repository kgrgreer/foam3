/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'CSSTokens',
  documentation: 'Provides defaults tokens for styling FObjects, should be replaced in ctx or refined',

  /**
   * TODO:
   * Find a better way to define these palettes
   * Find a way to alias
   * Use the color generator to create these
  */
  cssTokens: {
    'Blue50': '#D7E4FF',
    'Blue100': '#96B8F9',
    'Blue200': '#6795EE',
    'Blue300': '#366EDC',
    'Blue400': '#0A4AC6',
    'Blue500': '#04338D',
    'Blue600': '#022568',
    'Blue700': '#011B4E',

    'Yellow100': '#FFF3BF',
    'Yellow200': '#FFEFAC',
    'Yellow300': '#F9E48B',
    'Yellow400': '#F5DB6B',
    'Yellow500': '#DCC252',
    'Yellow600': '#BF9C06',
    'Yellow700': '#846B02',
    'Yellow50': '#FFFCEC',

    'Orange50': '#FFEEE2',
    'Orange100': '#FFC499',
    'Orange200': '#F9A264',
    'Orange300': '#F79651',
    'Orange400': '#FC7F27',
    'Orange500': '#EC6D14',
    'Orange600': '#B04A01',
    'Orange700': '#773100',

    'Purple50': '#F5EEFF',
    'Purple100': '#CEAFF6',
    'Purple200': '#B98AF5',
    'Purple300': '#9863DD',
    'Purple400': '#8843DF',
    'Purple500': '#702AC8',
    'Purple600': '#4D1299',
    'Purple700': '#2B0061',

    'Green50': '#E8FFED',
    'Green100': '#9AECAC',
    'Green200': '#77D98D',
    'Green300': '#59D374',
    'Green400': '#34CF56',
    'Green500': '#06A92A',
    'Green600': '#02801D',
    'Green700': '#005112',

    'Red50': '#FFEFF0',
    'Red100': '#FA9095',
    'Red200': '#F05B63',
    'Red300': '#E93F48',
    'Red400': '#E11721',
    'Red500': '#C40610',
    'Red600': '#96060D',
    'Red700': '#650005',

    'Grey50': '#F7F7F7',
    'Grey100': '#EFEFEF',
    'Grey200': '#DADADA',
    'Grey300': '#A8A8A8',
    'Grey400': '#8D8D8D',
    'Grey500': '#6F6F6F',
    'Grey600': '#525252',
    'Grey700': '#393939',

    'warmGrey50': '#FBF9F6',
    'warmGrey100': '#EDEAE5',
    'warmGrey200': '#E7E4DF',
    'warmGrey300': '#D1CDC5',
    'warmGrey400': '#B1AEA7',
    'warmGrey500': '#969289',
    'warmGrey600': '#747067',
    'warmGrey700': '#545048',

    'Black50': '#373737',
    'Black100': '#292929',
    'Black200': '#202020',
    'Black300': '#1B1B1B',
    'Black400': '#1C1C1C',
    'Black500': '#0F0F0F',
    'Black600': '#0C0C0C',
    'Black700': '#0D0D0D',

    'Primary50': '$Blue50',
    'Primary100': '$Blue100',
    'Primary200': '$Blue200',
    'Primary300': '$Blue300',
    'Primary400': '$Blue400',
    'Primary500': '$Blue500',
    'Primary600': '$Blue600',
    'Primary700': '$Blue700',

    'White': '#FFFFFF',
    'Error': '#E11721',
    'Info': '#FC7F27',
    'Warn': '#F5DB6B',
    'Success': '#34CF56'
  }
});
