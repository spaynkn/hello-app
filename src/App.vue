<template>
  <div id="app">
    <!-- サイトタイトル -->
    <h1 class="site-title">YouTube 再生アプリ（検索対応）</h1>

    <!-- レスポンシブプレイヤー -->
    <div class="player" v-if="currentVideo">
      <div class="iframe-container">
        <iframe
          :src="currentVideoUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- 検索フォーム -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="動画タイトルを検索"
        @keyup.enter="performSearch"
      />
      <button @click="performSearch">検索</button>
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">クリア</button>
    </div>

    <!-- カルーセル -->
    <div class="carousel-wrapper">
      <div class="carousel" ref="carousel">
        <div
          class="video-item"
          v-for="(video, index) in filteredVideos"
          :key="index"
          @click="selectVideoByFiltered(index)"
          :class="{ active: currentVideoIndex === video.originalIndex }"
        >
          <img :src="video.thumbnail" alt="thumbnail" class="thumbnail" />
          <div class="info">
            <div class="title-container">
              <span class="title">{{ video.title }}</span>
              <span class="tooltip">{{ video.title }}</span>
            </div>
            <span class="duration">{{ video.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      videos: [],
      currentVideoIndex: 0,
      currentVideoUrl: "",
      searchQuery: "",
      filteredVideos: []
    }
  },
  computed: {
    currentVideo() {
      return this.videos[this.currentVideoIndex]
    }
  },
  created() {
    fetch("https://raw.githubusercontent.com/spaynkn/external/refs/heads/main/videos.json")
      .then(res => res.json())
      .then(data => {
        // 元データにオリジナルのインデックスを追加
        this.videos = data.map((v, i) => ({ ...v, originalIndex: i }))
        this.filteredVideos = [...this.videos]
        if (this.videos.length > 0) {
          this.currentVideoIndex = 0
          this.updateVideoUrl(0, false)
        }
      })
  },
  mounted() {
    // ホイールで横スクロール
    this.$refs.carousel.addEventListener("wheel", (e) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      this.$refs.carousel.scrollBy({
        left: e.deltaY,
        behavior: "smooth"
      })
    })
  },
  methods: {
    selectVideoByFiltered(filteredIndex) {
      const video = this.filteredVideos[filteredIndex]
      this.currentVideoIndex = video.originalIndex
      this.updateVideoUrl(video.originalIndex, true)
    },
    selectVideo(index) {
      this.currentVideoIndex = index
      this.updateVideoUrl(index, true)
    },
    updateVideoUrl(index, autoplay) {
      const video = this.videos[index]
      const baseUrl = video.url.split('?')[0]
      const start = video.start || 0
      const isPC = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      this.currentVideoUrl = isPC && autoplay
        ? `${baseUrl}?autoplay=1&start=${start}`
        : `${baseUrl}?autoplay=0&start=${start}`
    },
    performSearch() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) {
        this.filteredVideos = [...this.videos]
        return
      }
      this.filteredVideos = this.videos.filter(v =>
        v.title.toLowerCase().includes(query)
      )
    },
    clearSearch() {
      this.searchQuery = ""
      this.filteredVideos = [...this.videos]
    }
  }
}
</script>

<style scoped>
#app {
  max-width: 700px;
  margin: 0 auto;
  font-family: sans-serif;
  text-align: center;
}

/* サイトタイトル */
.site-title {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.5em;
  margin-bottom: 20px;
  box-sizing: border-box;
}

/* レスポンシブプレイヤー */
.iframe-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  margin-bottom: 20px;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 横向きスマホ対応 */
@media (max-width: 900px) and (orientation: landscape) {
  .iframe-container {
    padding-top: 40%;
  }
}

/* 検索バー */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
}

.search-bar input {
  flex: 1;
  padding: 6px 8px;
  font-size: 0.9em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.search-bar button {
  padding: 6px 10px;
  font-size: 0.9em;
  border-radius: 4px;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.search-bar button:hover {
  background-color: #0056b3;
}

.clear-btn {
  background-color: #ccc;
  border-color: #999;
  color: #333;
}

.clear-btn:hover {
  background-color: #999;
  color: #fff;
}

/* カルーセル */
.carousel-wrapper {
  overflow: hidden;
}

.carousel {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  scroll-snap-type: x mandatory;
  padding: 5px 0;
  -webkit-overflow-scrolling: touch;
}

.carousel::-webkit-scrollbar {
  height: 6px;
}

.carousel::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}

.video-item {
  flex: 0 0 150px;
  scroll-snap-align: start;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 5px;
  transition: transform 0.2s, background 0.2s;
  text-align: left;
}

.video-item.active {
  background-color: #f0f8ff;
  border-color: #00f;
  transform: scale(1.05);
}

.thumbnail {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 5px;
}

.info {
  display: flex;
  flex-direction: column;
}

/* タイトル省略 + ツールチップ */
.title-container {
  position: relative;
  display: inline-block;
}

.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 0.9em;
}

.tooltip {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
}

.title-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.duration {
  font-size: 0.8em;
  color: #666;
}

/* レスポンシブ対応 */
@media (max-width: 900px) {
  .video-item {
    flex: 0 0 70%;
  }
}
</style>
