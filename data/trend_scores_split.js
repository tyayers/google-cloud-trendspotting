function transform(line) {
  var values = line.split(",");
  var obj = new Object();

  obj.name = values[0];
  obj.geo = values[1];
  obj.date = values[2];
  obj.score = values[3];

  var jsonString = JSON.stringify(obj);
  return jsonString;
}
