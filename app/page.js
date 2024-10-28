'use client'

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  Target, 
  ArrowUpCircle, 
  Calendar, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  X,
  AlertCircle 
} from 'lucide-react';

export default function Page() {
  // States
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal: '',
    category: 'Career',
    purpose: '',
    dueDate: '',
    progress: 0,
    status: 'in_progress'
  });

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetch goals from Firebase
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'goals'));
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(goalsData);
    } catch (err) {
      setError('Failed to fetch goals');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        ...newGoal,
        created: new Date().toISOString(),
        progress: 0,
        status: 'in_progress'
      });
      setGoals(prev => [...prev, { id: docRef.id, ...newGoal }]);
      setIsModalOpen(false);
      setNewGoal({
        goal: '',
        category: 'Career',
        purpose: '',
        dueDate: '',
        progress: 0,
        status: 'in_progress'
      });
    } catch (err) {
      setError('Failed to add goal');
      console.error('Error adding goal:', err);
    }
  };

  // Update goal progress
  const updateProgress = async (goalId, newProgress) => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      const updatedStatus = newProgress >= 100 ? 'completed' : 'in_progress';
      await updateDoc(goalRef, {
        progress: newProgress,
        status: updatedStatus
      });
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, progress: newProgress, status: updatedStatus };
        }
        return goal;
      }));
    } catch (err) {
      setError('Failed to update progress');
      console.error('Error updating progress:', err);
    }
  };

  // Delete goal
  const deleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteDoc(doc(db, 'goals', goalId));
        setGoals(goals.filter(goal => goal.id !== goalId));
      } catch (err) {
        setError('Failed to delete goal');
        console.error('Error deleting goal:', err);
      }
    }
  };

  // Calculate days left
  const getDeadlineStatus = (dueDate) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Goals Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Goals Card */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-500 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Goals</p>
              <p className="text-3xl font-bold">{goals.length}</p>
            </div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-orange-500 rounded-xl">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600">In Progress</p>
              <p className="text-3xl font-bold">
                {goals.filter(g => g.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-500 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-3xl font-bold">
                {goals.filter(g => g.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{goal.goal}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {goal.category}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{goal.purpose}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {}} // Add edit functionality
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  className="p-2 hover:bg-red-50 rounded-full"
                  onClick={() => deleteGoal(goal.id)}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => updateProgress(goal.id, Math.min(goal.progress + 10, 100))}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Update Progress
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Goal</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.goal}
                  onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Career">Career</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Spiritual development">Spiritual development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <textarea
                  value={newGoal.purpose}
                  onChange={(e) => setNewGoal({...newGoal, purpose: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Goal
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}