<template>
  <div class="comment-row d-flex align-items-start" :class="{ 'comment-row--highlight': highlight }">
    <a :href="comment | usernameUrl" class="comment-row__avatar" target="_blank">
      <img :src="comment | avatarUrl" class="rounded-circle" />
    </a>
    <div class="w-100">
      <div class="comment-row__header d-flex mb-1">
        <a :href="comment | usernameUrl" target="_blank" class="comment-row__header__author font-weight-bold">
          {{ comment.username }}
        </a>
        <div class="ml-auto">
          <abbr class="comment-row__header__date" :title="comment.created_at | longDate(locale)">
            <a :href="comment.full_url" target="_blank">
              {{ comment.created_at | shortDate(locale) }}
            </a>
          </abbr>
        </div>
      </div>
      <div class="comment-row__text" v-html="cooked(comment)"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentRow',
  props: {
    comment: {
      type: Object,
      required: true
    },
    highlight: {
      type: Boolean
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
      return cooked
        .split('src="//').join(`src="${window.location.protocol}//`)
        .split('src="/').join(`src="${origin}/`)
        .split('href="/').join(`target="_blank" href="${origin}/`)
    }
  },
  computed: {
    locale () {
      return this.$i18n ? this.$i18n.locale : 'en'
    }
  }
}
</script>

<style lang="scss" scoped>
  @keyframes highlight {
    from {
      background-color: var(--warning);
    }
    to {
      background-color: transparent;
    }
  }

  .comment-row {
    padding: 1rem;
    border-bottom: 1px solid var(--light);

    &--highlight {
      animation: highlight 5s linear;
      animation-play-state: initial;
    }

    &__avatar {
      width: calc(45px + 1rem);

      img {
        width: 100%;
        max-width: 45px;
      }
    }

    &__header {

      &__author {
        color: inherit;
      }

      &__date a {
        color: var(--gray)
      }
    }

    &__text {
      max-width: 690px;

      & >>> img.emoji {
        width: 20px;
        height: 20px;
        vertical-align: middle;
      }
      
      & >>> .meta {
        display:none;
      }

      & >>> .quote {
        margin-bottom: 1rem;
        display: block;

        .title {
          border-left: 5px solid var(--light);
          background-color: var(--lighter);
          color: var(--dark);
          padding: 0.8rem 0.8rem 0px 0.8rem;
        }

        blockquote {
          margin: 0;
          padding: 0.8rem;
          border-left: 5px solid var(--light);
          background-color: var(--lighter);
          clear: both;

          & > :last-child {
              margin-bottom: 0;
          }
        }
      }

    }
  }
</style>
