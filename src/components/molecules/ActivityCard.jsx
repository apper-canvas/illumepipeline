import React from 'react';
import { format } from 'date-fns';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ActivityCard = ({ activity, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      Call: 'blue',
      Email: 'green',
      Meeting: 'purple',
      Note: 'gray',
      Task: 'orange'
    };
    return colors[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      Call: 'Phone',
      Email: 'Mail',
      Meeting: 'Users',
      Note: 'FileText',
      Task: 'CheckSquare'
    };
    return icons[type] || 'Calendar';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-${getTypeColor(activity.type_c)}-100 flex items-center justify-center`}>
            <ApperIcon name={getTypeIcon(activity.type_c)} className={`w-5 h-5 text-${getTypeColor(activity.type_c)}-600`} />
          </div>
          <div>
            <Badge variant={getTypeColor(activity.type_c)}>
              {activity.type_c || 'Unknown'}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activity)}
            className="p-1"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity)}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {activity.description_c || 'No description'}
      </p>

      {/* Footer */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center">
          <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
          {formatDate(activity.date_c)}
        </div>
        {activity.contact_id_c && (
          <div className="flex items-center">
            <ApperIcon name="User" className="w-4 h-4 mr-2" />
            {activity.contact_id_c.Name || 'Unknown Contact'}
          </div>
        )}
        {activity.deal_id_c && (
          <div className="flex items-center">
            <ApperIcon name="DollarSign" className="w-4 h-4 mr-2" />
            {activity.deal_id_c.Name || 'Unknown Deal'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;