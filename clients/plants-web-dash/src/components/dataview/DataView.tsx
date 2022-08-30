import type { Component } from 'solid-js'
import { createSignal, createEffect, onMount, mergeProps, For, Show } from "solid-js"
import { useParams, useRouteData } from "@solidjs/router";
import styles from './DataView.module.css'

import plantdata from '../../assets/plantdata.js'

export const DataView: Component = (props) => {
  const params = useParams();
  const mergedProps = mergeProps({ setTopBar: function (name: string) { }, setSelectedName: function (name: string) { } }, props);

  const [items, setItems] = createSignal(plantdata)
  const [item, setItem] = createSignal(items().find(item => item['Name'].toLowerCase() === params.name.toLowerCase()))

  const [searchName, setSearchName] = createSignal(params.name.replace("-", "+").replace(" or ", " ").split(",")[0])

  createEffect(() => {
    setSearchName(params.name.replace("-", "+").replace(" or ", " ").split(",")[0])
    setItem(items().find(item => item['Name'].toLowerCase() === params.name.toLowerCase()))
    mergedProps.setTopBar(params.name)

    var divInterestElem = document.getElementById('trendsInterestChart');
    divInterestElem.innerHTML = "";
    trends.embed.renderExploreWidgetTo(divInterestElem, "TIMESERIES", { "comparisonItem": [{ "keyword": searchName(), "geo": "", "time": "today 12-m" }], "category": 0, "property": "" }, { "exploreQuery": "geo=DE&q=aloe%20vera%20plant&date=today 12-m", "guestPath": "https://trends.google.com:443/trends/embed/" });

    var divGeoElem = document.getElementById('trendsGeoChart');
    divGeoElem.innerHTML = "";
    trends.embed.renderExploreWidgetTo(divGeoElem, "GEO_MAP", { "comparisonItem": [{ "keyword": searchName(), "geo": "", "time": "today 12-m" }], "category": 0, "property": "" }, { "exploreQuery": "q=aloe%20vera&date=today 12-m", "guestPath": "https://trends.google.com:443/trends/embed/" });

    var divYouTubeElem = document.getElementById('youTubeInterestChart');
    divYouTubeElem.innerHTML = "";
    trends.embed.renderExploreWidgetTo(divYouTubeElem, "TIMESERIES", { "comparisonItem": [{ "keyword": searchName(), "geo": "", "time": "today 12-m" }], "category": 0, "property": "youtube" }, { "exploreQuery": "gprop=youtube&q=aloe%20vera&date=today 12-m", "guestPath": "https://trends.google.com:443/trends/embed/" });

    var divYouTubeGeoElem = document.getElementById('youTubeGeoChart');
    divYouTubeGeoElem.innerHTML = "";
    trends.embed.renderExploreWidgetTo(divYouTubeGeoElem, "GEO_MAP", { "comparisonItem": [{ "keyword": searchName(), "geo": "", "time": "today 12-m" }], "category": 0, "property": "youtube" }, { "exploreQuery": "gprop=youtube&q=aloe%20vera&date=today 12-m", "guestPath": "https://trends.google.com:443/trends/embed/" });

  });

  return (
    <div class={styles.dataview_frame}>
      <div class={styles.toc_frame}>
        <div class={styles.toc_title}>On this page</div>
        <div><a class={styles.toc_item} href="#news_interest">News volume</a></div>
        <div><a class={styles.toc_item} href="#news_tone">News tone</a></div>
        <div><a class={styles.toc_item} href="#news_geo">News locations</a></div>
        <div><a class={styles.toc_item} href="#news_language">News languages</a></div>
        <div><a class={styles.toc_item} href="#search_interest">Google interest</a></div>
        <div><a class={styles.toc_item} href="#search_geo">Google locations</a></div>
        <div><a class={styles.toc_item} href="#youtube_interest">YouTube interest</a></div>
        <div><a class={styles.toc_item} href="#youtube_geo">YouTube locations</a></div>
      </div>
      <div class={styles.page_frame}>
        <div>
          Plant Database &gt; {item()["Name"]}
        </div>
        <Show when={item()}>
          <h1 class={styles.header_title_text}>{item()["Name"]}</h1>
        </Show>
        <div class={styles.header_container}>
          <div class={styles.header_title}>
            <Show when={item()}>
              {/* <h1 class={styles.header_title_text}>{item()["Name"]}</h1> */}
              {item()["Description"]}
            </Show>
          </div>
          <div class={styles.header_image}>
            <Show when={item() && item()["Picture"] != ""}
              fallback={
                <img class={styles.detail_header_image} src="https://www.goshin-jutsu-no-michi.de/wp-content/themes/betheme/functions/builder/pre-built/images/placeholders/780x780b.png"></img>
              }>
              <img class={styles.detail_header_image} src={item()["Picture"]}></img>
            </Show>
          </div>
        </div>
        <br />
        {/* <h1>
          <span class={styles.detail_header_text}></span>
        </h1> */}
        <div>
          <h2 id="news_interest">News Volume</h2>
          <iframe class={styles.chart} src={"https://api.gdeltproject.org/api/v2/doc/doc?query=" + searchName().replace(" ", "%20") + "%20plant&mode=timelinevolinfo&TIMELINESMOOTH=5"}></iframe>
        </div>
        <div>
          <h2 id="news_tone">News Average Tone</h2>
          <iframe class={styles.chart} src={"https://api.gdeltproject.org/api/v2/doc/doc?query=" + searchName().replace(" ", "%20") + "%20plant&mode=timelinetone&TIMELINESMOOTH=5"}></iframe>
        </div>
        <div id="news_geo">
          <h2>News Geographic Interest</h2>
          <iframe class={styles.chart} src={"https://api.gdeltproject.org/api/v2/doc/doc?query=" + searchName().replace(" ", "%20") + "%20plant&mode=timelinelang&TIMELINESMOOTH=5"}></iframe>
        </div>
        <div>
          <h2 id="news_language">News Language Interest</h2>
          <iframe class={styles.chart} src={"https://api.gdeltproject.org/api/v2/doc/doc?query=" + searchName().replace(" ", "%20") + "%20plant&mode=timelinesourcecountry&TIMELINESMOOTH=5"}></iframe>
        </div>
        <div>
          <h2 id="search_interest">Google Search Interest</h2>
          <div id="trendsInterestChart"></div>
        </div>
        <div>
          <h2 id="search_geo">Google Search Geographic Distribution</h2>
          <div id="trendsGeoChart"></div>
        </div>
        <div>
          <h2 id="youtube_interest">YouTube Interest</h2>
          <div id="youTubeInterestChart"></div>
        </div>
        <div>
          <h2 id="youtube_geo">YouTube Geographic Distribution</h2>
          <div id="youTubeGeoChart"></div>
        </div>
      </div>

    </div >
  );
}