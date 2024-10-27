'use client'

import React, { useState } from 'react';
import {
  Target,
  Calendar,
  ArrowUpCircle,
  Plus
} from 'lucide-react';

export default function Page() {
  const [goals] = useState([
    {
      id: 1,
      goal: "Director",
      category: "Career",
      purpose: "More money",
      progress: 50,
      status: "in_progress",
      dueDate: "2024-12-31"
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Goals Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Add Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Goals</p>
              <p className="text-2xl font-bold">{goals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold">
                {goals.filter(g => g.status === "in_progress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold">
                {goals.filter(g => g.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}