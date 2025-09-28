module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/hello-app/'   // ← リポジトリ名に合わせる
    : '/'
}