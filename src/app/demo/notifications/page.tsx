import { NotificationCard } from "../../../components/entities/notification-card";
import { demoNotifications } from "../../../lib/demo/data";

export default function DemoNotificationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Alerts</h1>

      <ul className="space-y-2">
        {demoNotifications.map((notification) => (
          <li key={notification.id}>
            <NotificationCard
              type={notification.type}
              title={notification.title}
              message={notification.message}
              createdAt={notification.createdAt}
              unread={notification.unread}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
