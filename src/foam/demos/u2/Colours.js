foam.CLASS({
  name: 'Colours',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'hues'
    }
  ],

  methods: [
    function rgbToGrey(rgb /*[0..255,0.255,0.255]*/) /* -> 0..1 */ {
      var [r, g, b] = rgb;
//      return (r/255+g/255+b/255)/3;
//Gray = (Red * 0.3 + Green * 0.59 + Blue * 0.11)
//console.log('rgbg', r,g,b,0.3 * r/255 + 0.59 * g/255 + 0.11 * b/255);
//return 0.3 * r/255 + 0.59 * g/255 + 0.11 * b/255;
      return 0.3 * r/255.0 + 0.59 * g/255.0 + 0.11 * b/255.0;
    },

    function adjustRGBBrightness(rgb /*[0..255,0.255,0.255]*/, br/*0..1*/) {
    //  return [255 * br, 255 * br, 255 * br];
      var [r, g, b] = rgb;
      var gr = this.rgbToGrey(rgb);
      var scale = br/gr;

     //console.log('adjustRGB', r,g,b, ' provided: ', gr, ' desired: ', br, 'achieved: ', this.rgbToGrey([r * scale, g * scale, b * scale]));
      return [r * scale, g * scale, b * scale];
    },

    function hslToRgb(h, s, l) {
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
      return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
//      return `rgb(${Math.floor((r*0.3+g*0.6+b*0.1)/3)},${Math.floor((r*0.3+g*0.6+b*0.1)/3)},${Math.floor((r*0.3+g*0.6+b*0.1)/3)})`;
//      return `hsl(${hue},70%,${l/10}%)`;
    },

    function render() {
      var self = this;
      this.start('table').
        call(function() {
          for ( var l = 50 ; l <= 900 ; l = l == 50 ? 100 : l + 100 ) {
            this.start('tr').call(function() {
              for ( var hue = 0 ; hue < 360 ; hue += 20 ) {
                var l2 = 1000-(l+500)%950;
                var l3 =
                self.rgbToGrey(self.adjustRGBBrightness(self.hslToRgb(hue/360, 0.95, .6), Math.sqrt((1000-l*0.95)/1000)));
                this.start('th').style({xxxcolor: 'black', color: 'black' /*self.hl(hue+180,l2)*/, width: '80px', height: '80px', background: self.hl(hue, l)}).add(Math.floor(100*l3)).end();
              }
            }).end();
          }
        }).
      end();
    }
  ]
});
