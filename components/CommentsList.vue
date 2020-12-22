<template>
  <div class="comments-list">
    <div v-for="comment in comments" :key="comment.id" class="comments-list__comment border-top mt-2 mb-4 p-1">
      <div class="comments-list__comment__header row no-gutters">
        <div class="comments-list__comment__header__author col-6 font-weight-bold">
          {{ comment.username }}
        </div>
        <div class="comments-list__comment__header__date col-6 text-right">
          {{ comment.created_at }}
        </div>
      </div>
      <div class="comments-list__comment__text" v-html="comment.cooked"></div>
      <a :href="comment.full_url" target="_blank">
        Edit on I-Hub
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentsList',
  props: {
    comments: {
      type: Array
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
