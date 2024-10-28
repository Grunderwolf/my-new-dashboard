// ===== SECTION 1: IMPORTS =====
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
  AlertCircle,
  Menu, // Added for mobile menu
  Filter // Added for mobile filters
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';

// ===== SECTION 2: CHART REGISTRATION =====
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// ===== SECTION 3: CONSTANTS =====
const categories = [
  'Business',
  'Career',
  'Community Service',
  'Family',
  'Habits and Skills',
  'Health and Fitness',
  'Investments',
  'Personal Growth',
  'Relationship',
  'Spiritual'
];

const categoryColors = {
  'Business': 'bg-blue-100 text-blue-800',
  'Career': 'bg-purple-100 text-purple-800',
  'Community Service': 'bg-green-100 text-green-800',
  'Family': 'bg-pink-100 text-pink-800',
  'Habits and Skills': 'bg-yellow-100 text-yellow-800',
  'Health and Fitness': 'bg-red-100 text-red-800',
  'Investments': 'bg-indigo-100 text-indigo-800',
  'Personal Growth': 'bg-orange-100 text-orange-800',
  'Relationship': 'bg-rose-100 text-rose-800',
  'Spiritual': 'bg-teal-100 text-teal-800',
  default: 'bg-gray-100 text-gray-800'
};

// ===== SECTION 4: MAIN COMPONENT =====
export default function Page() {
  // ===== SECTION 4A: STATES =====
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  const [newGoal, setNewGoal] = useState({
    goal: '',
    category: 'Business',
    purpose: '',
    dueDate: '',
    progress: 0,
    status: 'in_progress'
  });

  // ===== SECTION 4B: EFFECTS =====
  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    // Close mobile menu when category is selected
    if (selectedCategory !== 'All') {
      setIsMobileFilterOpen(false);
    }
  }, [selectedCategory]);

  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);
  
  // ===== SECTION 4C: FUNCTIONS =====
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
        category: 'Business',
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
  // Add after other functions
const calculateCategoryAnalytics = () => {
  const analytics = categories.map(category => {
    const categoryGoals = goals.filter(g => g.category === category);
    const completedGoals = categoryGoals.filter(g => g.status === 'completed');
    
    return {
      category,
      total: categoryGoals.length,
      completed: completedGoals.length,
      inProgress: categoryGoals.filter(g => g.status === 'in_progress').length,
      completionRate: categoryGoals.length > 0 
        ? Math.round((completedGoals.length / categoryGoals.length) * 100) 
        : 0,
      averageProgress: categoryGoals.length > 0
        ? Math.round(categoryGoals.reduce((acc, goal) => acc + goal.progress, 0) / categoryGoals.length)
        : 0
    };
  }).filter(cat => cat.total > 0); // Only show categories with goals

  return analytics;
};
  // ===== SECTION 4D: RENDER CHECKS =====
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // ===== SECTION 4E: MAIN RENDER/RETURN =====
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Goals Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Stats Cards Section */}
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

      {/* Progress Chart Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Progress by Category</h2>
        <div className="w-full h-[400px]">
          <Bar 
            data={{
              labels: categories,
              datasets: [
                {
                  label: 'Total Goals',
                  data: categories.map(category => 
                    goals.filter(g => g.category === category).length
                  ),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue
                },
                {
                  label: 'Completed',
                  data: categories.map(category => 
                    goals.filter(g => g.category === category && g.status === 'completed').length
                  ),
                  backgroundColor: 'rgba(16, 185, 129, 0.5)', // green
                }
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Goals by Category'
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Category Filter Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* Categories Analytics Section */}
<div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
  <h2 className="text-2xl font-bold mb-6">Category Analytics</h2>
  
  {/* Analytics Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {/* Chart Section */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
      <div className="h-[300px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: categories.filter(cat => 
              goals.some(g => g.category === cat)
            ),
            datasets: [{
              data: categories.map(cat => 
                goals.filter(g => g.category === cat).length
              ),
              backgroundColor: [
                'rgba(59, 130, 246, 0.5)', // blue
                'rgba(16, 185, 129, 0.5)', // green
                'rgba(249, 115, 22, 0.5)', // orange
                'rgba(239, 68, 68, 0.5)',  // red
                'rgba(139, 92, 246, 0.5)', // purple
                'rgba(236, 72, 153, 0.5)', // pink
                'rgba(245, 158, 11, 0.5)', // yellow
                'rgba(75, 85, 99, 0.5)',   // gray
                'rgba(14, 165, 233, 0.5)', // light blue
                'rgba(168, 85, 247, 0.5)'  // violet
              ]
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>

    {/* Metrics Section */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Category Performance</h3>
      <div className="space-y-4">
        {calculateCategoryAnalytics().map(({ category, total, completed, completionRate, averageProgress }) => (
          <div key={category} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{category}</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                completionRate >= 75 ? 'bg-green-100 text-green-800' :
                completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {completionRate}% Complete
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Goals</p>
                <p className="font-semibold">{total}</p>
              </div>
              <div>
                <p className="text-gray-600">Completed</p>
                <p className="font-semibold">{completed}</p>
              </div>
              <div>
                <p className="text-gray-600">Avg Progress</p>
                <p className="font-semibold">{averageProgress}%</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
      {/* Goals List Section */}
      <div className="space-y-4">
        {goals
          .filter(goal => selectedCategory === 'All' || goal.category === selectedCategory)
          .map(goal => (
            <div key={goal.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{goal.goal}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[goal.category] || categoryColors.default}`}>
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

        {goals.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              No goals found. Click the "Add Goal" button to create your first goal!
            </p>
          </div>
        )}
      </div>

      {/* Add Goal Modal Section */}
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
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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