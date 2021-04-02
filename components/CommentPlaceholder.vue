<script>
  import 'intersection-observer'
  import { random } from 'lodash'

  export default {
    name: 'CommentPlaceholder',
    props: {
      comment: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        observer: null,
        contentPlaceholderRows: [
          {
            height: '1em',
            boxes: [[0, '100%']]
          }
        ]
      }
    },
    mounted () {
      return this.bindObserver()
    },
    methods: {
      async bindObserver () {
        this.observer = this.createObserver()
        // Ensure the element is mounted before binding it to the observer
        await this.$nextTick()
        // Observe the component element
        this.observer.observe(this.$el)
      },
      createObserver () {
        return new IntersectionObserver(async entries => {
          if (entries[0].isIntersecting) {
            /**
             * The placeholder enters the viewport.
             *
             * @event visible
             */
            this.$emit('visible', this.comment)
          }
        })
      },
      rowStyle ({ minWidth = 10, maxWith = 100 } = {}) {
        const width = `${random(minWidth, maxWith)}%`
        return { width }
      }
    },
    computed: {
      authorRowStyle () {
        return this.rowStyle({ maxWith: 25 })
      },
      firstRowStyle () {
        return this.rowStyle()
      }
    }
  }
</script>

<template>
  <div class="comment-placeholder d-flex align-items-start">
    <div class="comment-placeholder__avatar"></div>
    <div class="w-100">
      <div class="comment-placeholder__header">
        <div class="comment-placeholder__header__author">
          <content-placeholder :rows="contentPlaceholderRows" class="p-0 mb-2" :style="authorRowStyle" />
        </div>
      </div>
      <div class="comment-placeholder__text mb-4">
        <content-placeholder :rows="contentPlaceholderRows" class="p-0" :style="firstRowStyle" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .comment-placeholder {
    padding: 1rem;
    border-bottom: 1px solid var(--light);

    &__avatar {
      max-width: 45px;
      margin-right: 1rem;
      width: 100%;

      &:after {
        content: "";
        width: 100%;
        padding-top: 100%;
        background: var(--light);
        display: block;
        border-radius: 50%;
      }
    }
  }
</style>
