import { markRaw } from 'vue'
import Comments from './components/Comments.vue'
import CommentsFloatingLink from './components/CommentsFloatingLink.vue'
import CommentsTabLabel from './components/CommentsTabLabel.vue'

document.addEventListener('datashare:ready', async ({ detail: { core } }) => {
  // Register a floating link to the comment form
  core.registerHook({ 
    target: 'document.content:before', 
    definition: CommentsFloatingLink
  })
  // Register a post-pipeline function for the `document-view-tabs` category
  core.registerPipeline({
    name: 'document-view-tabs',
    category: 'document-view-tabs',
    // The function that is applied to the tabs list
    type (tabs, document) {
      const tab = {
        name: 'comments-tab',
        label: 'Comments',
        labelComponent: markRaw(CommentsTabLabel),
        icon: 'align-left',
        props: { document },
        component: markRaw(Comments)
      }
      return [...tabs, tab]
    }
  })
})
