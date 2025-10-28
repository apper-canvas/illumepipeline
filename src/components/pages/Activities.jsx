import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/organisms/Header';
import ActivityCard from '@/components/molecules/ActivityCard';
import ActivityForm from '@/components/molecules/ActivityForm';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { activitiesService } from '@/services/api/activitiesService';
import { contactsService } from '@/services/api/contactsService';
import { dealsService } from '@/services/api/dealsService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const activityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Note', label: 'Note' },
    { value: 'Task', label: 'Task' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activitiesService.getAll(),
        contactsService.getAll(),
        dealsService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type_c === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => {
        const description = (activity.description_c || '').toLowerCase();
        const type = (activity.type_c || '').toLowerCase();
        const contactName = activity.contact_id_c?.Name?.toLowerCase() || '';
        const dealName = activity.deal_id_c?.Name?.toLowerCase() || '';
        
        return description.includes(query) || 
               type.includes(query) || 
               contactName.includes(query) ||
               dealName.includes(query);
      });
    }

    return filtered;
  }, [activities, searchQuery, selectedType]);

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsAddModalOpen(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleDeleteActivity = (activity) => {
    setSelectedActivity(activity);
    setIsDeleteModalOpen(true);
  };

  const handleSaveActivity = async (activityData) => {
    try {
      if (selectedActivity) {
        await activitiesService.update(selectedActivity.Id, activityData);
        toast.success('Activity updated successfully');
      } else {
        await activitiesService.create(activityData);
        toast.success('Activity created successfully');
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save activity');
      console.error('Error saving activity:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;

    try {
      await activitiesService.delete(selectedActivity.Id);
      toast.success('Activity deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedActivity(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
      console.error('Error deleting activity:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your activities and track interactions
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddActivity}
              className="flex items-center"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Filter" className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedType === type.value
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <Empty
            title="No activities found"
            description={searchQuery || selectedType !== 'all' 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first activity"
            }
            action={
              !searchQuery && selectedType === 'all' ? (
                <Button variant="primary" onClick={handleAddActivity}>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredActivities.map((activity) => (
                <motion.div
                  key={activity.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ActivityCard
                    activity={activity}
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Activity"
      >
        <ActivityForm
          contacts={contacts}
          deals={deals}
          onSave={handleSaveActivity}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Activity"
      >
        <ActivityForm
          activity={selectedActivity}
          contacts={contacts}
          deals={deals}
          onSave={handleSaveActivity}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Activity"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this activity? This action cannot be undone.
          </p>
          {selectedActivity && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedActivity.type_c}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedActivity.description_c}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Activities;