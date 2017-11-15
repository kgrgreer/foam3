Date.prototype.toString = function () {
  var month = this.getMonth() + 1;
  var date = this.getDate();
  var year = this.getFullYear();
  var hours = this.getHours();
  var minutes = this.getMinutes();
  var isPm = false;

  if ( hours >= 12 ) {
    hours -= 12;
    isPm = true;
  }

  if ( hours === 0 ) {
    hours = 12;
  }



  return month + '/' +
    date + '/' +
    year + ', ' +
    hours + ':' +
    ('0' + minutes).slice(-2) + ( isPm ? ' PM' : ' AM' );
}