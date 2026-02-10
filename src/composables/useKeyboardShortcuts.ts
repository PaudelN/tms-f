import { onMounted, onUnmounted } from 'vue'

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  const listener = (event: KeyboardEvent): void => {
    for (const shortcut of shortcuts) {
      const ctrlMatch = Boolean(shortcut.ctrl) === (event.ctrlKey || event.metaKey)
      const shiftMatch = Boolean(shortcut.shift) === event.shiftKey
      const altMatch = Boolean(shortcut.alt) === event.altKey
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault()
        shortcut.action()
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', listener))
  onUnmounted(() => window.removeEventListener('keydown', listener))
}
