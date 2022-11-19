const idGenerator = (charlength) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ1234567890";
  let string_length = charlength;
  let randomstring = "";
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};
module.exports = idGenerator;
