import CommentsCard from './components/CommentsCard.vue'
import CommentsToggler from './components/CommentsToggler.vue'

document.addEventListener('datashare:ready', async ({ detail: { core } }) => {
  core.i18n.global.mergeLocaleMessage('en', {
    commentsToggler: {
      label: '0 comments | 1 comment | {n} comments'
    }
  })

  core.registerHook({
    name: 'document-user-actions-comments-toggler',
    target: 'document-user-actions:after',
    definition: CommentsToggler
  })

  core.registerHook({
    name: 'document-user-actions-comments-card',
    target: 'document-user-actions-cards:after',
    definition: CommentsCard
  })
})
