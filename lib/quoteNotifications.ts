import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { notifHour, wantsNotifications } from "@/constants/onboarding";
import { QUOTES } from "@/constants/quotes";

export const NOTIF_ENABLED_KEY = "quotes_notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL = "daily-quote";

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Daily quote",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function ensurePermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === "granted";
}

function weekdayTriggers(hour: number, often: string): Notifications.SchedulableNotificationTriggerInput[] {
  const weekdays =
    often === "weekdays" ? [2, 3, 4, 5, 6] : often === "few" ? [2, 4, 6] : null;
  if (weekdays) {
    return weekdays.map((weekday) => ({
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute: 0,
      channelId: CHANNEL,
    }));
  }
  return [
    {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
      channelId: CHANNEL,
    },
  ];
}

function randomQuoteContent(): Notifications.NotificationContentInput {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]!;
  return {
    title: "Thrive",
    subtitle: q.author,
    body: q.text,
    data: { quoteId: q.id },
  };
}

if (__DEV__) {
  const sample = randomQuoteContent();
  console.assert(typeof sample.body === "string" && QUOTES.some((q) => q.text === sample.body));
}

export async function syncQuoteNotifications(opts: {
  enabled: boolean;
  whenId: string;
  oftenId: string;
}): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!opts.enabled || !wantsNotifications(opts.oftenId)) return false;
  const ok = await ensurePermission();
  if (!ok) return false;
  const hour = notifHour(opts.whenId);
  for (const trigger of weekdayTriggers(hour, opts.oftenId)) {
    await Notifications.scheduleNotificationAsync({
      content: randomQuoteContent(),
      trigger,
    });
  }
  return true;
}
