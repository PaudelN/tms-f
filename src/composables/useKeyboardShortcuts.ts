import { onMounted, onUnmounted } from 'vue'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  const handler = (event: KeyboardEvent): void => {
    shortcuts.forEach((shortcut) => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true
      const shiftMatch = shortcut.shift ? event.shiftKey : true
      const altMatch = shortcut.alt ? event.altKey : true
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault()
        shortcut.action()
      }
    })
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => window.removeEventListener('keydown', handler))
}
