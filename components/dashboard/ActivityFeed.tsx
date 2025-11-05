import React from 'react';
import Card from '../common/Card';
import { mockNotifications } from '../../data/mockData';
import { timeAgo } from '../../utils/timeAgo';

const ActivityFeed: React.FC = () => {
    // Using notifications as a proxy for an activity feed
    const activities = mockNotifications.slice(0, 5); // show latest 5

    return (
        <Card title="Recent Activity" bodyClassName="p-0">
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {activities.map(activity => (
                    <li key={activity.id} className="p-4 hover:bg-secondary/50">
                        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">{timeAgo(activity.timestamp)}</p>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default ActivityFeed;