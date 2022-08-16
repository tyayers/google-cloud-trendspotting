import { Component, createSignal, createEffect } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import { Menu } from './components/menu/Menu';

const App: Component = () => {
  const [plantsUrl, setPlantsUrl] = createSignal("https://wikipediascraper-qtw3rvj3ya-ew.a.run.app/tables?site=https://en.wikipedia.org/wiki/List_of_plants_used_in_herbalism&flatten=true")
  const [selectedPlant, setSelectedPlant] = createSignal("")
  const [detailUrl, setDetailUrl] = createSignal("https://www.wikipedia.org")

  createEffect(() => {
    console.info(selectedPlant())
    setDetailUrl(`https://api.gdeltproject.org/api/v2/summary/summary?d=web&t=summary&k=${selectedPlant().replace("-", "+")}+plant+medicine&ts=full&svt=zoom&sgt=yes&stc=yes&sta=list&c=1`)
  });

  return (
    <div class={styles.app_container}>
      <div class={styles.menu_frame} >
        <Menu data={plantsUrl()} setSelected={setSelectedPlant}></Menu>
      </div>
      <iframe class={styles.detail_frame} src={detailUrl()}></iframe>
    </div >
  );
};

export default App;
