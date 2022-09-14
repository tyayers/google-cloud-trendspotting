import type { Component } from 'solid-js'
import { createSignal, createEffect, onMount, mergeProps, For, Show } from "solid-js"
import { Link } from "@solidjs/router"
import plantdata from '../../assets/plantdata.js'
import styles from './Menu.module.css'

export const Menu: Component = (props) => {
  const mergedProps = mergeProps({ data: [], setSelected: function (name: string) { }, setTopBar: function (name: string, scrollIntoView: boolean) { }, filter: "", selectedName: "" }, props);
  const [topicSingular, setTopicSingular] = createSignal(import.meta.env.VITE_TOPIC_SINGULAR)
  const [topicPlural, setTopicPlural] = createSignal(import.meta.env.VITE_TOPIC_PLURAL)
  
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
          <Link class={getLineClass(item['Name'])} href={"/" + topicPlural() + "/" + item['Name']} id={"menuItem_" + item['Name']} onClick={(e) => { mergedProps.setTopBar(item['Name'], false) }}>
            <Show
              when={item['Image']}
              fallback={<img class={styles.list_image} src="https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"></img>}
            >
              <img class={styles.list_image} src={item['Image']}></img>
            </Show>
            <div>
              <div class={styles.list_line_title}>{item['Name']}</div>
              <div class={styles.list_line_description}>{item['Description']}</div>
            </div>
          </Link>
        </Show>
      }</For>
    </div >
  );
};
