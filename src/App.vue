<template>
  <div id="app">
    <h1>YouTube 再生アプリ</h1>

    <div class="player" v-if="currentVideo">
      <iframe
        width="560"
        height="315"
        :src="currentVideo.url"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <ul class="video-list">
      <li
        v-for="(video, index) in videos"
        :key="index"
        @click="selectVideo(video)"
        :class="{ active: currentVideo && video.url === currentVideo.url }"
      >
        <span class="title">{{ video.title }}</span>
        <span class="duration">{{ video.duration }}</span>
      </li>
    </ul>
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
    // JSONファイルを外部から取得
    fetch("https://raw.githubusercontent.com/spaynkn/external/refs/heads/main/videos.json")
      .then(res => res.json())
      .then(data => {
        this.videos = data
        if (data.length > 0) {
          this.currentVideo = data[0] // 最初の動画をセット
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