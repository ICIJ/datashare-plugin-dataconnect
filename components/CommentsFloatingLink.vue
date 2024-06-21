<script>
import { faReply } from '@fortawesome/free-solid-svg-icons/faReply'

export default {
  name: 'CommentsFloatingLink',
  icons: {
    faReply
  }
}
</script>

<template>
  <router-link 
    :to="{ query: { tab: 'comments-tab' } }"
    class="comments-floating-link btn btn-secondary" 
    title="Leave a comment" 
    v-b-tooltip>
    <fa :icon="$options.icons.faReply" /> 
  </router-link>
</template>

<style lang="scss" scoped>
  .comments-floating-link {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    height: 3rem;
    width: 3rem;
    line-height: 3rem;
    border-radius: 1.5rem;
    padding: 0;
    z-index: 500;

    & > * {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
