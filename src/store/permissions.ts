import { defineStore } from 'pinia';
import { reactive } from 'vue';
import {
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/api/notification';
import { trace } from "tauri-plugin-log-api";

export interface AppPermission {
  notification: boolean;
}

export default defineStore('app-permissions', () => {
  const appPermission = reactive<AppPermission>({
    notification: false,
  });

  isPermissionGranted().then((isNotificationPermissionGranted) => {
    trace(`isNotificationPermissionGranted: ${isNotificationPermissionGranted}`, )
    appPermission.notification = isNotificationPermissionGranted;
    if (!appPermission.notification) {
      requestPermission().then((permission) => {
        trace(`requestPermission: ${permission}`)
        appPermission.notification = permission === 'granted';
      });
    }
  });

  return { appPermission };
});
