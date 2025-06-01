
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotifications, NotificationProvider } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useState } from 'react';

const NotificationsContent = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'catalog' | 'cart' | 'admin' | 'seller'>('catalog');
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();


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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* <Navbar currentView={currentView} setCurrentView={setCurrentView} /> */}
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <h1 className="text-2xl font-bold">All Notifications</h1>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              {notifications.length === 0 ? (
                <div className="p-16 text-center text-gray-500">
                  <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p>You're all caught up! New notifications will appear here.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {notifications.map((notification, index) => (
                    <div key={notification._id}>
                      <div
                        className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          notification.isRead ? 'opacity-60' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(notification.updatedAt, { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification._id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
};

const Notifications = () => {
  return (
    <NotificationProvider>
      <NotificationsContent />
    </NotificationProvider>
  );
};

export default Notifications;
