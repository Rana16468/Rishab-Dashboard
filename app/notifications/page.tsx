"use client";

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const { addNotification, notifications, unreadCount, isConnected } = useSocket();
  const [message, setMessage] = useState('');

  const sendTestNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    addNotification({
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: `This is a test ${type} notification sent at ${new Date().toLocaleTimeString()}`,
      type,
    });
  };

  const sendCustomNotification = () => {
    if (!message.trim()) return;
    
    addNotification({
      title: 'Custom Message',
      message: message,
      type: 'info',
    });
    setMessage('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔔 Notification System Test</h1>
        <p className="text-gray-600">
          Test the real-time notification system. Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Test Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => sendTestNotification('info')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Info
              </Button>
              <Button
                onClick={() => sendTestNotification('success')}
                variant="outline"
                className="flex items-center gap-2 text-green-600 border-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                Success
              </Button>
              <Button
                onClick={() => sendTestNotification('warning')}
                variant="outline"
                className="flex items-center gap-2 text-yellow-600 border-yellow-600"
              >
                <AlertTriangle className="w-4 h-4" />
                Warning
              </Button>
              <Button
                onClick={() => sendTestNotification('error')}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-600"
              >
                <AlertTriangle className="w-4 h-4" />
                Error
              </Button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter custom message..."
                className="w-full px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && sendCustomNotification()}
              />
              <Button
                onClick={sendCustomNotification}
                className="w-full"
                disabled={!message.trim()}
              >
                Send Custom Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Notification Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Notifications:</span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Unread:</span>
              <Badge variant="destructive">{unreadCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Connection Status:</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications yet. Send some test notifications!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{notification.title}</h4>
                    <Badge
                      variant={
                        notification.type === 'success'
                          ? 'default'
                          : notification.type === 'error'
                          ? 'destructive'
                          : notification.type === 'warning'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{new Date(notification.timestamp).toLocaleString()}</span>
                    <span>{notification.read ? 'Read' : 'Unread'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
