import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';

const ActivityForm = ({ activity, contacts = [], deals = [], onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type_c: '',
    date_c: '',
    description_c: '',
    contact_id_c: '',
    deal_id_c: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activity) {
      setFormData({
        type_c: activity.type_c || '',
        date_c: activity.date_c ? new Date(activity.date_c).toISOString().slice(0, 16) : '',
        description_c: activity.description_c || '',
        contact_id_c: activity.contact_id_c?.Id || '',
        deal_id_c: activity.deal_id_c?.Id || ''
      });
    } else {
      // Set default date to now
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        date_c: now.toISOString().slice(0, 16)
      }));
    }
  }, [activity]);

  const activityTypes = [
    { value: '', label: 'Select Type' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Note', label: 'Note' },
    { value: 'Task', label: 'Task' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.type_c) {
      newErrors.type_c = 'Type is required';
    }

    if (!formData.date_c) {
      newErrors.date_c = 'Date is required';
    }

    if (!formData.contact_id_c) {
      newErrors.contact_id_c = 'Contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Format data for API
    const activityData = {
      type_c: formData.type_c,
      date_c: new Date(formData.date_c).toISOString(),
      description_c: formData.description_c,
      contact_id_c: parseInt(formData.contact_id_c)
    };

    // Only include deal_id_c if it's selected
    if (formData.deal_id_c) {
      activityData.deal_id_c = parseInt(formData.deal_id_c);
    }

    onSave(activityData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <Select
          name="type_c"
          value={formData.type_c}
          onChange={handleChange}
          options={activityTypes}
          error={errors.type_c}
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time <span className="text-red-500">*</span>
        </label>
        <Input
          type="datetime-local"
          name="date_c"
          value={formData.date_c}
          onChange={handleChange}
          error={errors.date_c}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description_c"
          value={formData.description_c}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Enter activity description..."
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact <span className="text-red-500">*</span>
        </label>
        <Select
          name="contact_id_c"
          value={formData.contact_id_c}
          onChange={handleChange}
          options={[
            { value: '', label: 'Select Contact' },
            ...contacts.map(contact => ({
              value: contact.Id,
              label: contact.name_c || contact.Name || `Contact ${contact.Id}`
            }))
          ]}
          error={errors.contact_id_c}
        />
      </div>

      {/* Deal (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deal (Optional)
        </label>
        <Select
          name="deal_id_c"
          value={formData.deal_id_c}
          onChange={handleChange}
          options={[
            { value: '', label: 'Select Deal' },
            ...deals.map(deal => ({
              value: deal.Id,
              label: deal.name_c || deal.Name || `Deal ${deal.Id}`
            }))
          ]}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {activity ? 'Update' : 'Create'} Activity
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;