import { Component, createSignal, createEffect, Show, For, onMount } from 'solid-js';
import { Router, Routes, Route, Link, useParams } from "@solidjs/router";

import styles from './App.module.css';
import { Menu } from './components/menu/Menu';
import { DataView } from './components/dataview/DataView';
import { Trending } from './components/trending/Trending';
import plantdata from './assets/plantdata.js'
import topbar from 'topbar';

import logo from './assets/logo.png'
import leaf from './assets/leaf.png'
import gdelt from './assets/gdelt.png'
import trends from './assets/trends.jpg'
import bigquery from './assets/bigquery.png'
import trends_up from './assets/trends_up.png'

const fetchData = async () => {
  return (await fetch(import.meta.env.VITE_ENTITIES_URL)).json();
  // return plantdata;
}

const App: Component = () => {
  const params = useParams();

  const [topicSingular, setTopicSingular] = createSignal(import.meta.env.VITE_TOPIC_SINGULAR)
  const [topicPlural, setTopicPlural] = createSignal(import.meta.env.VITE_TOPIC_PLURAL)
  const [items, setItems] = createSignal([])
  const [selectedName, setSelectedName] = createSignal(params.name)
  const [selectedItem, setSelectedItem] = createSignal(undefined)
  const [detailUrl, setDetailUrl] = createSignal("https://www.wikipedia.org")
  const [filter, setFilter] = createSignal("")
  const [menuVisible, setMenuVisible] = createSignal(false)

  document.title = topicSingular()[0].toUpperCase() + topicSingular().substring(1) + " Trend Tracker"

  //Data function
  function ItemData({ params, location, navigate, data }) {
    const item = items().find(item => item['Name'].toLowerCase() === params.name.toLowerCase());
    return item;
  }

  const setSelected = (item: any, name: string) => {
    // if (i != -1)
    //   setSelectedIndex(i)
    // else
    //   setSelectedIndex(items().indexOf(item))
    setMenuVisible(false)
    
    if (item) {
      setSelectedItem(item)
      setSelectedName(item["Name"])
    }
    else if (name != "") {
      let item = items().find(item => item['Name'] === name);

      if (item) {
        setSelectedItem(item)
        setSelectedName(name)
      }

      let elem = document.getElementById("menuItem_" + name);
      if (elem)
        elem.scrollIntoView({ block: "center", inline: "nearest" });
    }
    else {
      setSelectedName("")
      setSelectedItem(undefined)
    }
    // setSelectedName(item["Name"])
  }

  const setName = (name: string) => {
    setSelectedName(name);
  }

  const getPicture = (name: string) => {
    let result = "https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"
    let item = items().find(item => item['Name'].toLowerCase() === name.toLowerCase());

    if (item && item["Image"])
      result = item["Image"]

    return result
  }

  onMount(async () => {
    fetchData().then((result) => {
      setItems(result[topicPlural()].sort(function (a, b) {
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
    if (selectedItem() != undefined)
      setDetailUrl(`https://api.gdeltproject.org/api/v2/summary/summary?d=web&t=summary&k=${selectedName().replace("-", "+").replace(" or ", " ").split(",")[0]}+plant&ts=full&svt=zoom&sgt=yes&stt=yes&ssm=yes&slm=country&stc=yes&sta=list&c=1`)
  });

  const setTopBar = (name: string) => {
    if (name != "") {
      setMenuVisible(false);
      setSelectedName(name);
      topbar.show();
      setTimeout(() => {
        topbar.hide();
      }, 5000)

      setTimeout(() => {
        let elem = document.getElementById("menuItem_" + name);
        if (elem)
          elem.scrollIntoView({ block: "center", inline: "nearest" });
      }, 500)
    }
  }

  createEffect(() => {
    if (selectedItem() != undefined)
      setTopBar(selectedName())
  })

  window.addEventListener('resize', (e) => {
    setMenuVisible(false);
  });

  return (
    <div>
      <div class={styles.navbar}>
        <span onmousedown={(e) => setMenuVisible(!menuVisible())} class={styles.menu_button + " material-symbols-outlined"}>
          menu
        </span>
        <Link href="/" class={styles.header_leftbox}>
          {/* <img class={styles.header_logo} src={logo}></img> */}
          <span class={styles.header_logo + " material-symbols-outlined"}>trending_up</span>
          <span class={styles.header_text} >{topicSingular()[0].toUpperCase() + topicSingular().substring(1) + " Trend Tracker"}</span>
          <div class={styles.header_rightbox}>
            <a href="https://www.gdeltproject.org/" target="_blank"><img style={{ opacity: ".4" }} class={styles.header_rightbox_logo} src={gdelt}></img></a>
            <a href="https://trends.google.com/" target="_blank"><img class={styles.header_rightbox_logo} src={trends}></img></a>
            <a href="https://cloud.google.com/bigquery" target="_blank"><img style={{ height: "43px", "margin-left": "-6px" }} class={styles.header_rightbox_logo} src={bigquery}></img></a>

          </div>
        </Link>
      </div>
      <div class={styles.app_container}>
        <div class={styles.menu_frame} >
          <div class={styles.search_box}>
            <span class={styles.search_icon + " material-symbols-outlined"}>filter_list</span>
            <input class={styles.search_field} oninput={(e) => setFilter(e.target.value)} placeholder="Filter"></input>
          </div>
          <Menu data={items()} setSelected={setSelected} selectedName={selectedName()} filter={filter()} setTopBar={setTopBar}></Menu>
        </div>
        <Routes>
          <Route path="/" element={
            <Trending items={items()} setTopBar={setTopBar}></Trending>
          } />
          <Route path={"/" + topicPlural() + "/:name"} element={
            <div class={styles.detail_empty_frame}>
              <DataView items={items()} setTopBar={setTopBar} setSelectedName={setName}></DataView>
            </div>
          } data={ItemData} />
        </Routes>
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
    </div >
  );
};

export default App;
