
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatString } from '@/utils/helpers';

interface NotificationListProps {
  onClose: () => void;
  onViewAll?: () => void;
}

const NotificationList = ({ onClose, onViewAll }: NotificationListProps) => {
  const { notifications,isLoading, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

   console.log("unreadCount", unreadCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show only first 5 notifications in dropdown
  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-gray-500">({unreadCount} unread)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="p-2">
            {displayedNotifications.map((notification, index) => (
              <div key={notification._id}>
                <div
                  className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    notification.isRead ? 'opacity-60' : ''
                  } ${getNotificationColor(notification.type)}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatString(notification.message, 40)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(notification.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification._id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {index < displayedNotifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
            
            {notifications.length > 5 && (
              <>
                <Separator className="my-2" />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center" 
                    onClick={onViewAll}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View all {notifications.length} notifications
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
