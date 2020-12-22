import Comments from './components/Comments'
import CommentsTabLabel from './components/CommentsTabLabel'

document.addEventListener('datashare:ready', async ({ detail: { core } }) => {
  // We register a post-pipeline function for the `document-view-tabs` category
  core.registerPipeline({
    name: 'document-view-tabs',
    category: 'document-view-tabs',
    // The function that is applied to the tabs list
    type (tabs, document) {
      const tab = {
        name: 'comments-tab',
        label: 'Comments',
        labelComponent: CommentsTabLabel,
        icon: 'align-left',
        props: { document },
        component: Comments
      }
      return [...tabs, tab]
    }
  })
})
