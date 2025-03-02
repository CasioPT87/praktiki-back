import { getUnreadUserNotifications } from '..';
import { GlobalUsersManager } from '../../user/manager';
import { NotificationMessage } from '../../../types/utilities';

export async function sendInitialNotificationsToUser(userId: string) {
  const notifications = await getUnreadUserNotifications({ userId });
  const userManager = GlobalUsersManager.getUser(userId);
  if (userManager && notifications && notifications.length > 0) {
    const notificationMessages: NotificationMessage[] = notifications.map(
      (notification) => ({
        message: notification.text,
        created: notification.created_at,
      })
    );
    userManager.sendNotificationMessages(notificationMessages);
  }
}
