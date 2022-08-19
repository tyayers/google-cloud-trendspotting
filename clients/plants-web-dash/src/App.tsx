import { Component, createSignal, createEffect, Show, onMount } from 'solid-js';
import topbar from 'topbar';

import styles from './App.module.css';
import { Menu } from './components/menu/Menu';
import plantdata from './assets/plantdata.js'

import logo from './assets/logo.webp'
import leaf from './assets/leaf.png'
import gdelt from './assets/gdelt.png'
import trends from './assets/trends.jpg'
import bigquery from './assets/bigquery.png'
import trends_up from './assets/trends_up.png'

const fetchData = async () => {
  //   (await fetch(url)).json();
  return plantdata;
}

const App: Component = () => {
  //  const [plantsUrl, setPlantsUrl] = createSignal("https://wikipediascraper-qtw3rvj3ya-ew.a.run.app/tables?site=https://en.wikipedia.org/wiki/List_of_plants_used_in_herbalism&flatten=true")
  const [plantsUrl, setPlantsUrl] = createSignal("https://wikipediascraper-qtw3rvj3ya-ew.a.run.app/tables?site=https://en.wikipedia.org/wiki/List_of_plants_used_in_herbalism&flatten=true")
  const [items, setItems] = createSignal([]);

  const [selectedIndex, setSelectedIndex] = createSignal(-1)
  const [selectedName, setSelectedName] = createSignal("")
  const [selectedItem, setSelectedItem] = createSignal({})
  const [detailUrl, setDetailUrl] = createSignal("https://www.wikipedia.org")
  const [filter, setFilter] = createSignal("")
  const [menuVisible, setMenuVisible] = createSignal(false)

  const setSelected = (item: any, i: number) => {
    setSelectedIndex(i)
    setSelectedItem(item)
    setSelectedName(item["Name"])
  }

  onMount(async () => {
    fetchData().then((result) => {
      setItems(result.sort(function (a, b) {
        let x = a.Name.toLowerCase();
        let y = b.Name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      }))
    })
  })

  createEffect(() => {
    setMenuVisible(false)
    setDetailUrl(`https://api.gdeltproject.org/api/v2/summary/summary?d=web&t=summary&k=${selectedName().replace("-", "+").replace(" or ", " ").split(",")[0]}+plant&ts=full&svt=zoom&sgt=yes&stt=yes&ssm=yes&slm=country&stc=yes&sta=list&c=1`)
  });

  const setTopBar = (plant: string) => {
    if (plant != "") {
      topbar.show();
      setTimeout(() => {
        topbar.hide();
      }, 5000)
    }
  }

  createEffect(() => setTopBar(selectedName()))

  window.addEventListener('resize', (e) => {
    setMenuVisible(false);
  });

  return (
    <div>
      <div class={styles.navbar}>
        <span onmousedown={(e) => setMenuVisible(!menuVisible())} class={styles.menu_button + " material-symbols-outlined"}>
          menu
        </span>
        <img class={styles.header_logo} src={logo}></img>
        <span class={styles.header_text} onclick={(e) => setSelectedName("")}>Herbal Plant Trend Database</span>
        <div class={styles.header_rightbox}>
          <a href="https://www.gdeltproject.org/" target="_blank"><img style={{ opacity: ".4" }} class={styles.header_rightbox_logo} src={gdelt}></img></a>
          <a href="https://trends.google.com/" target="_blank"><img class={styles.header_rightbox_logo} src={trends}></img></a>
          <a href="https://cloud.google.com/bigquery" target="_blank"><img style={{ height: "43px", "margin-left": "-6px" }} class={styles.header_rightbox_logo} src={bigquery}></img></a>

        </div>
      </div>
      <div class={styles.app_container}>
        <div class={styles.menu_frame} >
          <div class={styles.search_box}>
            <span class={styles.search_icon + " material-symbols-outlined"}>filter_list</span>
            <input class={styles.search_field} oninput={(e) => setFilter(e.target.value)} placeholder="Filter"></input>
          </div>
          <Menu data={items()} setSelected={setSelected} selectedName={selectedName()} filter={filter()}></Menu>
        </div>
        <Show when={selectedName() != ""}>
          <h1 class={styles.detail_header}>
            <Show when={selectedItem()["Picture"] != ""}
              fallback={
                <img class={styles.detail_header_image} src="https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"></img>
              }>
              <img class={styles.detail_header_image} src={selectedItem()["Picture"]}></img>
            </Show>
            <span class={styles.detail_header_text}>{selectedName()}</span>
          </h1>
          <iframe class={styles.detail_frame} src={detailUrl()} onload={(e) => topbar.hide()}></iframe>
        </Show>
        <Show when={selectedName() == ""}>
          <div class={styles.detail_empty_frame}>
            <h1 class={styles.trending_title}>Top Trending</h1>
            <div class={styles.trending_container}>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Black cohosh')}>
                <div class={styles.trending_box_title}>Black cohosh</div>
                <div class={styles.trending_box_metric}>+41%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Bitter leaf')}>
                <div class={styles.trending_box_title}>Bitter leaf</div>
                <div class={styles.trending_box_metric}>+35%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Ginkgo')}>
                <div class={styles.trending_box_title}>Ginkgo</div>
                <div class={styles.trending_box_metric}>+31%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
            </div>
            <h1 class={styles.trending_title}>Watchlist</h1>
            <div class={styles.trending_container}>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Black cohosh')}>
                <div class={styles.trending_box_title}>Black cohosh</div>
                <div class={styles.trending_box_metric}>+41%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Bitter leaf')}>
                <div class={styles.trending_box_title}>Bitter leaf</div>
                <div class={styles.trending_box_metric}>+35%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
              <div class={styles.trending_box} onclick={(e) => setSelectedName('Ginkgo')}>
                <div class={styles.trending_box_title}>Ginkgo</div>
                <div class={styles.trending_box_metric}>+31%</div>
                <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                  trending_up
                </span>
              </div>
            </div>
          </div>
        </Show>
        {/* <Show when={selectedName() == ""}>
          <div class={styles.detail_empty_frame} >
            <div class={styles.detail_empty_message}>
              <img class={styles.detail_image} src={leaf}></img><br></br>
              Please select a plant from the list on the left.
            </div>
          </div>
        </Show> */}
      </div >
      <Show when={menuVisible()}>
        <div class={styles.menu_popup} onclick={(e) => { setMenuVisible(false) }}>
          <div class={styles.menu_popup_container} onclick={(e) => { e.stopPropagation() }}>
            <div class={styles.navbar}>
              <img class={styles.header_logo} src={logo}></img>
              <span class={styles.header_text} onclick={(e) => setSelectedName("")}>Herbal Plants</span>
              <span onclick={(e) => setMenuVisible(false)} class={styles.menu_button_close + " material-symbols-outlined"}>
                close
              </span>
            </div>
            <div class={styles.menu_frame_popup} >
              <div class={styles.search_box}>
                <span class={styles.search_icon + " material-symbols-outlined"}>filter_list</span>
                <input class={styles.search_field} oninput={(e) => setFilter(e.target.value)} placeholder="Filter"></input>
              </div>
              <Menu data={items()} setSelected={setSelected} selectedName={selectedName()} filter={filter()}></Menu>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default App;
