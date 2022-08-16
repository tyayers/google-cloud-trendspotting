import type { Component } from 'solid-js';
import { createSignal, createEffect, onMount, mergeProps, For, Show } from "solid-js";

import styles from './Menu.module.css';

const fetchData = async (url: string) =>
  (await fetch(url)).json();

export const Menu: Component = (props) => {
  const mergedProps = mergeProps({ data: "", setSelected: function (name: string) { } }, props);
  const [items, setItems] = createSignal([]);

  onMount(async () => {
    setItems(await fetchData(mergedProps.data))
  });

  return (
    <div class={styles.list_container}>
      <For each={items()}>{(item, i) =>
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
      }</For>
      {/* <div>
        <pre>{JSON.stringify(plants(), null, 2)}</pre>
      </div> */}
    </div>
  );
};
