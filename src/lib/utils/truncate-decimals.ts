export function truncateDecimals(number: string, decimalPlaces = 2) {
  const decimalPlace = number.indexOf(".");
  if (decimalPlace === -1) {
    //No decimals
    return number;
  } else {
    return number.slice(0, decimalPlace + decimalPlaces + 1);
  }
}
