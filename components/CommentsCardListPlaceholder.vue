<script setup>
import { useElementVisibility, whenever } from '@vueuse/core'
import { useTemplateRef } from 'vue'

import { useCoreComponent } from '@/composables/useCoreComponent'

const emit = defineEmits(['visible'])

const element = useTemplateRef('element')
const elementIsVisible = useElementVisibility(element)
whenever(elementIsVisible, () => emit('visible'))

const DocumentUserCommentsListEntry = await useCoreComponent(
  'Document/DocumentUser/DocumentUserComments/DocumentUserCommentsListEntry'
)
const AppPlaceholder = await useCoreComponent('AppPlaceholder/AppPlaceholder')
</script>

<template>
  <document-user-comments-list-entry ref="element" class="comments-card-list-placeholder">
    <template #header>
      <div class="d-flex flex-row gap-1 mb-2 w-100 justify-content-between">
        <app-placeholder width="4em" height="1rem" />
        <app-placeholder width="2em" height="1rem" class="ml-auto" />
      </div>
    </template>
    <template #text>
      <div class="d-flex flex-column gap-1">
        <app-placeholder width="40%" height="1rem" />
        <app-placeholder width="50%" height="1rem" />
        <app-placeholder width="30%" height="1rem" />
      </div>
    </template>
  </document-user-comments-list-entry>
</template>

<style lang="scss" scoped>
@keyframes highlight {
  from {
    background-color: var(--bs-warning);
  }
  to {
    background-color: transparent;
  }
}

.comments-card-list-comment {
  &--highlight {
    animation: highlight 5s linear;
    animation-play-state: initial;
  }
}
</style>
