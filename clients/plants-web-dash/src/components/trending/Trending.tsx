import { Link } from '@solidjs/router';
import { Component, createSignal, createEffect, mergeProps, Show, For, onMount } from 'solid-js';
import styles from '../../App.module.css';

export const Trending: Component = (props) => {
  const mergedProps = mergeProps({ items: [] }, props);
  const [growthItems, setGrowthItems] = createSignal([])

  onMount(async () => {
    const res = await fetch(`https://storage.googleapis.com/planttrends-72642/outputs/plants_growth_rates.json`);
    setGrowthItems((await res.json()).sort(function (a, b) {
      let x = a.growth_rate;
      let y = b.growth_rate;
      if (x < y) { return 1; }
      if (x > y) { return -1; }
      return 0;
    }))
  })

  const getPicture = (name: string) => {
    let result = "https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"
    let item = mergedProps.items.find(item => item['Name'].toLowerCase() === name.toLowerCase());

    if (item && item["Picture"])
      result = item["Picture"]

    return result
  }

  return (
    <div class={styles.detail_empty_frame}>
      <div class={styles.trending_container}>
        <h1 class={styles.trending_title}>Top Trending</h1>
        <For each={growthItems()}>{(item, i) =>
          <Show when={item.growth_rate != "0.0" && parseFloat(item.growth_rate) > 100}>
            <Link class={styles.trending_box} href={"/plants/" + item.name}>
              <img class={styles.trending_header_image} src={getPicture(item.name)}></img>
              <div class={styles.trending_box_title}>{item.name}</div>
              <div class={styles.trending_box_metric}>{"+" + item.growth_rate + " %"}</div>
              <span class={styles.trending_box_icon + " material-symbols-outlined"}>
                trending_up
              </span>
            </Link>
          </Show>
        }</For>

      </div>

    </div>
  );
}