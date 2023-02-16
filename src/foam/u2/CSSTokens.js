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
   * Use the color generator to create these
  */
  cssTokens: {
    // COLOUR
    'blue50': '#D7E4FF',
    'blue100': '#96B8F9',
    'blue200': '#6795EE',
    'blue300': '#366EDC',
    'blue400': '#0A4AC6',
    'blue500': '#04338D',
    'blue600': '#022568',
    'blue700': '#011B4E',

    'yellow100': '#FFF3BF',
    'yellow200': '#FFEFAC',
    'yellow300': '#F9E48B',
    'yellow400': '#F5DB6B',
    'yellow500': '#DCC252',
    'yellow600': '#BF9C06',
    'yellow700': '#846B02',
    'yellow50': '#FFFCEC',

    'orange50': '#FFEEE2',
    'orange100': '#FFC499',
    'orange200': '#F9A264',
    'orange300': '#F79651',
    'orange400': '#FC7F27',
    'orange500': '#EC6D14',
    'orange600': '#B04A01',
    'orange700': '#773100',

    'purple50': '#F5EEFF',
    'purple100': '#CEAFF6',
    'purple200': '#B98AF5',
    'purple300': '#9863DD',
    'purple400': '#8843DF',
    'purple500': '#702AC8',
    'purple600': '#4D1299',
    'purple700': '#2B0061',

    'green50': '#E8FFED',
    'green100': '#9AECAC',
    'green200': '#77D98D',
    'green300': '#59D374',
    'green400': '#34CF56',
    'green500': '#06A92A',
    'green600': '#02801D',
    'green700': '#005112',

    'red50': '#FFEFF0',
    'red100': '#FA9095',
    'red200': '#F05B63',
    'red300': '#E93F48',
    'red400': '#E11721',
    'red500': '#C40610',
    'red600': '#96060D',
    'red700': '#650005',

    'grey50': '#F5F7FA',
    'grey100': '#F0F2F5',
    'grey200': '#E0E2E5',
    'grey300': '#DADDE2',
    'grey400': '#B2B6BD',
    'grey500': '#6B778C',
    'grey600': '#4B5768',
    'grey700': '#494F59',

    'warmGrey50': '#FBF9F6',
    'warmGrey100': '#EDEAE5',
    'warmGrey200': '#E7E4DF',
    'warmGrey300': '#D1CDC5',
    'warmGrey400': '#B1AEA7',
    'warmGrey500': '#969289',
    'warmGrey600': '#747067',
    'warmGrey700': '#545048',

    'black50': '#373737',
    'black100': '#292929',
    'black200': '#202020',
    'black300': '#1B1B1B',
    'black400': '#1C1C1C',
    'black500': '#0F0F0F',
    'black600': '#0C0C0C',
    'black700': '#0D0D0D',

    'primary50': '$blue50',
    'primary100': '$blue100',
    'primary200': '$blue200',
    'primary300': '$blue300',
    'primary400': '$blue400',
    'primary500': '$blue500',
    'primary600': '$blue600',
    'primary700': '$blue700',

    'destructive50': '$red50',
    'destructive100': '$red100',
    'destructive200': '$red200',
    'destructive300': '$red300',
    'destructive400': '$red400',
    'destructive500': '$red500',
    'destructive600': '$red600',
    'destructive700': '$red700',

    'success50': '$green50',
    'success100': '$green100',
    'success200': '$green200',
    'success300': '$green300',
    'success400': '$green400',
    'success500': '$green500',
    'success600': '$green600',
    'success700': '$green700',

    'warn50': '$yellow50',
    'warn100': '$yellow100',
    'warn200': '$yellow200',
    'warn300': '$yellow300',
    'warn400': '$yellow400',
    'warn500': '$yellow500',
    'warn600': '$yellow600',
    'warn700': '$yellow700',

    'white': '#FFFFFF',
    'black': '#000000',
    'destructive': '#E11721',
    'info': '#FC7F27',
    'warn': '#F5DB6B',
    'success': '#34CF56',

    // GENERAL STYLE TOKENS
    'inputHeight': '34px',
    'inputHorizontalPadding': '8px',
    'inputVerticalPadding': '8px',
    'inputBorderRadius': '4px',

    // FONT
    'font1': `'Source Sans Pro', 'Sans pro'`
  }
});
