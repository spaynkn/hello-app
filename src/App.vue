<template>
  <div id="app">
    <h1>YouTube 再生アプリ（開始位置再生対応）</h1>

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

    <!-- カルーセル -->
    <div class="carousel-wrapper">
      <div class="carousel" ref="carousel">
        <div
          class="video-item"
          v-for="(video, index) in videos"
          :key="index"
          @click="selectVideo(index)"
          :class="{ active: currentVideoIndex === index }"
        >
          <img :src="video.thumbnail" alt="thumbnail" class="thumbnail" />
          <div class="info">
            <span class="title">{{ video.title }}</span>
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
      currentVideoUrl: ""
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
        this.videos = data
        if (data.length > 0) {
          this.currentVideoIndex = 0
          this.updateVideoUrl(0, false) // 最初は自動再生しない
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
    selectVideo(index) {
      this.currentVideoIndex = index
      this.updateVideoUrl(index, true) // 選択時は自動再生（PC）
    },
    updateVideoUrl(index, autoplay) {
      const video = this.videos[index]
      const baseUrl = video.url.split('?')[0]
      const start = video.start || 0
      const isPC = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      this.currentVideoUrl = isPC && autoplay
        ? `${baseUrl}?autoplay=1&start=${start}`
        : `${baseUrl}?autoplay=0&start=${start}`
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

.title {
  font-weight: bold;
  font-size: 0.9em;
}

.duration {
  font-size: 0.8em;
  color: #666;
}

/* レスポンシブ対応 */
@media (max-width: 600px) {
  .video-item {
    flex: 0 0 70%;
  }

  .iframe-container {
    padding-top: 56.25%;
  }
}
</style>
