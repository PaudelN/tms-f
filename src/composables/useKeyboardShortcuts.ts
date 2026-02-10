import { onMounted, onUnmounted } from 'vue'

export interface Shortcut {
  key: string
  ctrl?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handler = (event: KeyboardEvent) => {
    shortcuts.forEach((shortcut) => {
      const withCtrl = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true
      if (withCtrl && event.key.toLowerCase() === shortcut.key.toLowerCase()) {
        event.preventDefault()
        shortcut.action()
      }
    })
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
