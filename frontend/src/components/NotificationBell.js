import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';

const TYPE_ICONS = {
  welcome: '👋',
  leave_approved: '✅',
  leave_rejected: '❌',
  attendance: '🕐',
  task_assigned: '📋',
  task_approved: '🎉',
  payroll: '💰',
  general: '🔔'
};

const TYPE_COLORS = {
  welcome: 'border-l-emerald-400',
  leave_approved: 'border-l-green-400',
  leave_rejected: 'border-l-red-400',
  attendance: 'border-l-blue-400',
  task_assigned: 'border-l-amber-400',
  task_approved: 'border-l-purple-400',
  payroll: 'border-l-yellow-400',
  general: 'border-l-slate-400'
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-800 transition">
        <Bell size={20} className="text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
            style={{ background: '#ef4444' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 rounded-2xl border border-slate-800 shadow-2xl z-50 overflow-hidden"
          style={{ background: '#0d1426' }}>

          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:underline">
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs text-red-400 hover:underline ml-2">
                  <Trash2 size={14} />
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={36} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif._id}
                  className={`flex gap-3 p-4 border-b border-slate-800 border-l-4 transition hover:bg-slate-800 hover:bg-opacity-30 ${TYPE_COLORS[notif.type]} ${!notif.isRead ? 'bg-slate-800 bg-opacity-20' : ''}`}>
                  <div className="text-xl flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.isRead && (
                          <button onClick={() => handleMarkAsRead(notif._id)}
                            className="p-1 text-amber-400 hover:bg-amber-400 hover:bg-opacity-10 rounded transition">
                            <CheckCheck size={12} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(notif._id)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400 hover:bg-opacity-10 rounded transition">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}