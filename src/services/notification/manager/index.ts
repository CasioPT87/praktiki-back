import { getUnreadUserNotifications } from '..';
import { UserManager } from '../../user/manager';
import { NotificationMessage } from '../../../types/utilities';
import { Socket } from 'socket.io';

export async function sendInitialNotificationsToUser(
  userManager: UserManager,
  socket: Socket
) {
  const notifications = await getUnreadUserNotifications({
    userId: userManager.userId,
  });
  if (userManager && notifications && notifications.length > 0) {
    const notificationMessages: NotificationMessage[] = notifications.map(
      (notification) => ({
        message: notification.text,
        created: notification.created_at,
      })
    );
    socket.emit(userManager.name, notificationMessages);
  }
}
