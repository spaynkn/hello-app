<template>
  <div id="app">
    <h1>YouTube 再生アプリ（スマホ対応スナップカルーセル）</h1>

    <!-- プレイヤー -->
    <div class="player" v-if="currentVideo">
      <iframe
        width="100%"
        height="200"
        :src="currentVideo.url"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- スナップカルーセル -->
    <div class="carousel">
      <div
        class="video-item"
        v-for="(video, index) in videos"
        :key="index"
        @click="selectVideo(video)"
        :class="{ active: currentVideo && video.url === currentVideo.url }"
      >
        <img :src="video.thumbnail" alt="thumbnail" class="thumbnail" />
        <div class="info">
          <span class="title">{{ video.title }}</span>
          <span class="duration">{{ video.duration }}</span>
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
      currentVideo: null
    }
  },
  created() {
    fetch("https://raw.githubusercontent.com/spaynkn/external/refs/heads/main/videos.json")
      .then(res => res.json())
      .then(data => {
        this.videos = data
        if (data.length > 0) {
          this.currentVideo = data[0]
        }
      })
  },
  methods: {
    selectVideo(video) {
      this.currentVideo = video
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

.player {
  margin-bottom: 20px;
}

/* スナップカルーセル */
.carousel {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  scroll-snap-type: x mandatory; /* スナップ設定 */
  padding: 5px 0;
  -webkit-overflow-scrolling: touch; /* iOSスムーズスクロール */
}

.carousel::-webkit-scrollbar {
  height: 6px;
}

.carousel::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
  border-radius: 3px;
}

.video-item {
  flex: 0 0 70%; /* スマホで1枚70%幅 */
  scroll-snap-align: start; /* スナップ位置 */
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
  transform: scale(1.05); /* 選択中は少し拡大 */
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
@media (min-width: 600px) {
  .video-item {
    flex: 0 0 150px; /* PCは固定幅 */
  }

  .player iframe {
    height: 315px;
  }
}
</style>
