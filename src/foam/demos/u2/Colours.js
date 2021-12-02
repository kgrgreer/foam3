foam.CLASS({
  name: 'Colours',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'hues'
    }
  ],

  methods: [
    function rgbToGrey(rgb) {
      var [r, g, b] = rgb;
      return 0.299 * r/255 + 0.587 * g/255 + 0.114 * b/255;
    },

    function adjustRGBBrightness(rgb, br) {
      var [r, g, b] = rgb;
      var gr = this.rgbToGrey(rgb);
      console.log(r,g,b, gr);
      var scale = br/gr;
      return [r * scale, g * scale, b * scale];
    },

    function hslToRgb(h, s, l){
      var r, g, b;

      if ( s == 0 ) {
        r = g = b = l;
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if ( t < 0 ) t += 1;
          if ( t > 1 ) t -= 1;
          if ( t < 1/6 ) return p + (q - p) * 6 * t;
          if ( t < 1/2 ) return q;
          if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    function hl(hue, l) {
//      var [r, g, b] = this.hslToRgb(hue/360, 0.8, l/1000);
      var [r, g, b] = this.adjustRGBBrightness(this.hslToRgb(hue/360, 0.95, .6), Math.sqrt((1000-l*0.95)/1000));
      return `rgb(${r},${g},${b})`;
//      return `hsl(${hue},70%,${l/10}%)`;
    },

    function render() {
      var self = this;
      this.start('table').
        call(function() {
          for ( var l = 50 ; l <= 900 ; l = l == 50 ? 100 : l + 100 ) {
            this.start('tr').call(function() {
              for ( var hue = 0 ; hue < 360 ; hue += 20 ) {
                this.start('th').style({color: self.hl(hue+180,950-l), width: '80px', height: '80px', background: self.hl(hue, l)}).add(l).end();
              }
            }).end();
          }
        }).
      end();
    }
  ]
});
