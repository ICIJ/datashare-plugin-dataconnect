<template>
  <div class="comments-list">
    <div v-for="comment in comments" :key="comment.id" class="comments-list__comment p-1 d-flex align-items-start">
      <a :href="comment | usernameUrl" class="comments-list__comment__avatar" target="_blank">
        <img :src="comment | avatarUrl" class="rounded-circle mr-2" />
      </a>
      <div class="w-100">
        <div class="comments-list__comment__header d-flex">
          <a :href="comment | usernameUrl" target="_blank" class="comments-list__comment__header__author font-weight-bold">
            {{ comment.username }}
          </a>
          <div class="ml-auto">
            <abbr class="comments-list__comment__header__date" :title="comment.created_at | longDate($i18n.locale)">
              <a :href="comment.full_url" target="_blank">
                {{ comment.created_at | shortDate($i18n.locale) }}
              </a>
            </abbr>
          </div>
        </div>
        <div class="comments-list__comment__text" v-html="cooked(comment)"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentsList',
  props: {
    comments: {
      type: Array,
      default: () => ([])
    }
  },
  filters: {
    shortDate (dateStr, locale) {
      const date = new Date(dateStr)
      const options = { month: "short", day: "numeric", year: "2-digit", hour: "numeric", minute: "numeric" }
      return date.toLocaleDateString(locale, options)
    },
    longDate (dateStr, locale) {
      const date = new Date(dateStr)
      const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
      return date.toLocaleDateString(locale, options)
    },
    avatarUrl ({ avatar_template: avatarTemplate, full_url: fullUrl }) {
      const { origin } = new URL(fullUrl)
      return `${origin}${avatarTemplate.replace('{size}', 45)}`
    },
    usernameUrl ({ full_url: fullUrl, username }) {
      const { origin } = new URL(fullUrl)
      return `${origin}/u/${username}/`
    }
  },
  methods: {
    cooked ({ cooked, full_url: fullUrl }) {
      const { origin } = new URL(fullUrl)
      return cooked.split('href="/').join(`target="_blank" href="${origin}/`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .comments-list {

    &__comment {

      &__avatar img {
        max-width: 45px;
      }

      &__header {

        &__author {
          color: inherit;
        }

        &__date a {
          color: var(--gray)
        }
      }

      &:not(:last-of-type) {
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--light);
      }

      &__text {
        max-width: 690px;
      }
    }

  }
</style>
