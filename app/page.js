'use client'

import React, { useState } from 'react';
import { Target, ArrowUpCircle, Calendar, Edit2, Trash2, ChevronRight, AlertCircle } from 'lucide-react';

export default function Page() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      goal: "Director",
      category: "Career",
      purpose: "More money",
      progress: 50,
      status: "in_progress",
      dueDate: "2024-12-31",
      created: "2024-01-01"
    },
    {
      id: 2,
      goal: "Peace",
      category: "Spiritual development",
      purpose: "To live in the world but not of it",
      progress: 5,
      status: "in_progress",
      dueDate: "2024-12-31",
      created: "2024-01-01"
    }
  ]);

  // Calculate days left
  const getDeadlineStatus = (dueDate) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  // Delete goal
  const deleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  // Update progress
  const updateProgress = (goalId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newProgress = Math.min(goal.progress + 10, 100);
        return { 
          ...goal, 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in_progress'
        };
      }
      return goal;
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Goals Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg">
          + Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Goals Card */}
        <div className="bg-blue-50 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-transparent hover:border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-500">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Goals</p>
              <p className="text-3xl font-bold mt-1">{goals.length}</p>
            </div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-orange-50 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-transparent hover:border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-orange-500">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">In Progress</p>
              <p className="text-3xl font-bold mt-1">
                {goals.filter(g => g.status === "in_progress").length}
              </p>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-green-50 rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-transparent hover:border-green-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-green-500">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-3xl font-bold mt-1">
                {goals.filter(g => g.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => {
          const daysLeft = getDeadlineStatus(goal.dueDate);
          
          return (
            <div key={goal.id} 
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{goal.goal}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {goal.category}
                    </span>
                  </div>
                  <p className="text-gray-600">{goal.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => {}}>
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  {daysLeft < 30 && goal.status !== "completed" && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{daysLeft} days left</span>
                    </div>
                  )}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button 
                  onClick={() => updateProgress(goal.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Update Progress
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No goals found. Click the "Add Goal" button to create your first goal!</p>
          </div>
        )}
      </div>
    </div>
  );
}