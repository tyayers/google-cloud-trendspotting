fn main() {
  println!("Hello, world!");

  let response =
    reqwest::blocking::get("https://en.wikipedia.org/wiki/List_of_plants_used_in_herbalism")
      .unwrap()
      .text()
      .unwrap();

  let document = scraper::Html::parse_document(&response);
  let row_selector = scraper::Selector::parse("table.wikitable>tbody>tr>td:nth-child(2)").unwrap();
  let plant_names = document.select(&row_selector).flat_map(|x| x.text());

  plant_names.for_each(|str| {
    if str.chars().count() > 4 {
      println!("Plant: {}.", str)
    }
  });
}

fn trim_newline(s: &mut String) {
  if s.ends_with('\n') {
    s.pop();
    if s.ends_with('\r') {
      s.pop();
    }
  }
}
