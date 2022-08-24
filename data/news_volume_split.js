function transform(line) {
  var values = line.split(",");
  var obj = new Object();
  obj.name = values[0];

  obj.date =
    values[1].substring(0, 4) +
    "-" +
    values[1].substring(4, 6) +
    "-" +
    values[1].substring(6, 8);

  obj.news_volume = values[2];
  obj.news_norm = values[3];

  var jsonString = JSON.stringify(obj);
  return jsonString;
}
