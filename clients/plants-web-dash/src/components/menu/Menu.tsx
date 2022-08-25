import type { Component } from 'solid-js'
import { createSignal, createEffect, onMount, mergeProps, For, Show } from "solid-js"
import plantdata from '../../assets/plantdata.js'
import styles from './Menu.module.css'

export const Menu: Component = (props) => {
  const mergedProps = mergeProps({ data: [], setSelected: function (name: string) { }, filter: "", selectedName: "" }, props);

  const getLineClass = (name: string) => {
    if (name == mergedProps.selectedName)
      return styles.list_line_selected;
    else
      return styles.list_line;
  }

  return (
    <div class={styles.list_container}>
      <For each={mergedProps.data}>{(item, i) =>
        <Show when={mergedProps.filter == "" || item['Name'].toLowerCase().includes(mergedProps.filter.toLowerCase())}>
          <div class={getLineClass(item['Name'])} id={"menuItem_" + item['Name']} onClick={(e) => { mergedProps.setSelected(item, "") }}>
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
