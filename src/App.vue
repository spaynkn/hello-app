<template>
  <div id="app">
    <!-- サイトタイトル -->
    <h1 class="site-title">YouTube 再生アプリ（検索＋初期10件表示）</h1>

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
          v-for="(video, index) in displayVideos"
          :key="index"
          @click="selectVideoByFiltered(index)"
          :class="{ active: currentVideoIndex === video.originalIndex }"
        >
          <!-- サムネイルを16:9固定で表示 -->
          <div class="thumb-wrapper">
            <img :src="video.thumbnail" alt="thumbnail" class="thumbnail" />
          </div>
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
      filteredVideos: [],
      displayVideos: [],
      displayCount: 10,
      currentVideoIndex: 0,
      currentVideoUrl: "",
      searchQuery: ""
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
        this.videos = data.map((v, i) => ({ ...v, originalIndex: i }))
        this.filteredVideos = [...this.videos]
        this.updateDisplayVideos()
        if (this.videos.length > 0) {
          this.currentVideoIndex = 0
          this.updateVideoUrl(0, false)
        }
      })
  },
  mounted() {
    this.$refs.carousel.addEventListener("scroll", this.onCarouselScroll)
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
      const video = this.displayVideos[filteredIndex]
      this.currentVideoIndex = video.originalIndex
      this.updateVideoUrl(video.originalIndex, true)
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
      } else {
        const keywords = query.split(/[\s\u3000]+/).filter(Boolean)
        this.filteredVideos = this.videos.filter(v =>
          keywords.every(k => v.title.toLowerCase().includes(k))
        )
      }
      this.displayCount = 10
      this.updateDisplayVideos()
    },
    clearSearch() {
      this.searchQuery = ""
      this.filteredVideos = [...this.videos]
      this.displayCount = 10
      this.updateDisplayVideos()
    },
    updateDisplayVideos() {
      this.displayVideos = this.filteredVideos.slice(0, this.displayCount)
    },
    onCarouselScroll() {
      const carousel = this.$refs.carousel
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
        if (this.displayCount < this.filteredVideos.length) {
          this.displayCount += 10
          this.updateDisplayVideos()
        }
      }
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
  box-sizing: border-box;
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
  padding-top: 56.25%;
  margin-bottom: 20px;
  border-radius: 12px; /* プレイヤー角丸 */
  overflow: hidden;
}

.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 900px) and (orientation: landscape) {
  .iframe-container {
    padding-top: 40%;
  }
}

/* 検索バー（スマホ拡大防止） */
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
  font-size: 16px; /* 16px以上でズーム防止 */
  border-radius: 4px;
  border: 1px solid #ccc;
  -webkit-text-size-adjust: 100%;
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
  scrollbar-gutter: stable;
  transform: translateZ(0);
}

.carousel::-webkit-scrollbar {
  height: 6px;
}

.carousel::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}

.video-item {
  flex: 0 0 150px; /* 固定幅 */
  scroll-snap-align: start;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 5px;
  transition: transform 0.2s, background 0.2s;
  text-align: left;
  box-sizing: border-box;
}

.video-item.active {
  background-color: #f0f8ff;
  border-color: #00f;
  transform: scale(1.05);
}

/* サムネイルを必ず16:9に統一 */
.thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 5px;
}

.info {
  display: flex;
  flex-direction: column;
  width: 100%; /* 親に揃える */
  box-sizing: border-box;
}

/* タイトル省略 + ツールチップ */
.title-container {
  position: relative;
  display: block; /* inline-block→block */
  width: 100%;
}

.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 0.8em;
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

/* スマホ対応 */
@media (max-width: 900px) {
  .video-item {
    flex: 0 0 70%;
  }
}

</style>
