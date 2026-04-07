import echo from "@/lib/echo";
import type { ActivityItem } from "@/types/activity.types";
import { onBeforeUnmount, onMounted } from "vue";

/**
 * useActivityChannel
 *
 * Subscribes to the private broadcast channel for a given entity and
 * calls onActivity() whenever a new ActivityLogged event arrives.
 *
 * Channel name matches routes/channels.php:
 *   task.{id}, pipeline.{id}, etc.
 *
 * Usage:
 *   useActivityChannel('task', taskId, (item) => timeline.insertRealtimeActivity(item))
 */
export function useActivityChannel(
  entityType: string,
  entityId: number,
  onActivity: (item: ActivityItem) => void,
) {
  // entityType from the API is plural ("tasks") — channel uses singular ("task")
  // Strip trailing 's' as a simple singularize. Extend if you have irregular plurals.
  const channelName = `${entityType.replace(/s$/, "")}.${entityId}`;

  let channel: ReturnType<typeof echo.private> | null = null;

  function subscribe() {
    channel = echo
      .private(channelName)
      .listen(".ActivityLogged", (data: ActivityItem) => {
        onActivity(data);
      });
  }

  function unsubscribe() {
    if (channel) {
      echo.leave(channelName);
      channel = null;
    }
  }

  onMounted(subscribe);
  onBeforeUnmount(unsubscribe);

  return { subscribe, unsubscribe };
}
