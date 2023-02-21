import { defineStore } from 'pinia';
import { reactive } from 'vue';
import {
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/api/notification';

export interface AppPermission {
  notification: boolean;
}

export default defineStore('app-permissions', () => {
  const appPermission = reactive<AppPermission>({
    notification: false,
  });

  isPermissionGranted().then((isNotificationPermissionGranted) => {
    console.log('isNotificationPermissionGranted', isNotificationPermissionGranted)
    appPermission.notification = isNotificationPermissionGranted;
    if (!appPermission.notification) {
      requestPermission().then((permission) => {
        console.log('requestPermission', permission)
        appPermission.notification = permission === 'granted';
      });
    }
  });

  return { appPermission };
});
