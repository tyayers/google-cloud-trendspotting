import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, mergeProps, For, Show } from "solid-js";
import plantdata from '../../assets/plantdata.js'
import styles from './Menu.module.css';

const fetchData = async (url: string) => {
  //   (await fetch(url)).json();
  return plantdata;
}

export const Menu: Component = (props) => {
  const mergedProps = mergeProps({ data: "", setSelected: function (name: string) { }, filter: "" }, props);
  const [items, setItems] = createSignal([]);

  onMount(async () => {
    fetchData(mergedProps.data).then((result) => {
      setItems(result.sort(function (a, b) {
        let x = a.Name.toLowerCase();
        let y = b.Name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      }))
    })
  })

  return (
    <div class={styles.list_container}>
      <For each={items()}>{(item, i) =>
        <Show when={mergedProps.filter == "" || item['Name'].toLowerCase().includes(mergedProps.filter.toLowerCase())}>
          <div class={styles.list_line} onClick={(e) => mergedProps.setSelected(item['Name'])}>
            <Show
              when={item['Picture']}
              fallback={<img class={styles.list_image} src="https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"></img>}
            >
              <img class={styles.list_image} src={item['Picture']}></img>
            </Show>

            <div>
              <div class={styles.list_line_title}>{item['Name']}</div>
              <div class={styles.list_line_description}>{item['Description']}</div>
            </div>
          </div>
        </Show>
      }</For>
    </div>
  );
};
