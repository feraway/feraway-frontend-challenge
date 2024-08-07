function countDecimals(num: string) {
  return (num.split(".")[1] || []).length;
}
