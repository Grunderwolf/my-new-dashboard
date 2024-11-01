// ===== SECTION 1: IMPORTS =====
'use client'

import { CheckCircle2, ListTodo } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { db, auth } from './firebase/config';
import { 
  Target, 
  ArrowUpCircle, 
  Calendar,
  Clock, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  X,
  RefreshCw,
  Archive,
  LogOut  // Added LogOut icon for sign out functionality
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
  ArcElement
} from 'chart.js';

// ===== SECTION 2: CHART REGISTRATION =====
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ===== SECTION 3: CONSTANTS =====
const motivationalQuotes = [
"Am I making choices today that align with the life I envision?",
"Is this action helping me become the person I want to be?",
"Am I investing my time in things that truly matter to me?",
"What small step can I take today to get closer to my dreams?",
"Am I surrounding myself with people who support my growth?",
"How would my future self thank me for the choices I make now?",
"What fear am I ready to face to reach my next level?",
"Is my current mindset helping or hindering my progress?",
"Am I holding onto anything that’s keeping me from moving forward?",
"How can I challenge myself today to expand my comfort zone?",
"Am I giving my best effort in areas that matter most?",
"What am I willing to sacrifice to achieve my dreams?",
"Is there a skill I can learn to help me succeed?",
"Am I prioritizing growth or comfort in my daily decisions?",
"What am I learning from today’s challenges?",
"How can I create more moments of joy on this journey?",
"Am I truly listening to my intuition about what’s right for me?",
"Who do I admire, and what qualities of theirs can I develop?",
"Is my lifestyle aligned with the goals I want to achieve?",
"What would I do if I knew I couldn’t fail?",
"How can I use my unique strengths to make progress?",
"What’s one thing I’ve been putting off that would bring me closer to my goal?",
"Am I grateful for the progress I’ve already made?",
"How would my life change if I took action on my dreams today?",
"What limiting beliefs can I let go of to grow?",
"Am I treating myself with the kindness and patience I need?",
"What legacy do I want to build with my actions?",
"How can I make today more meaningful in pursuit of my goals?",
"What’s one thing I can start doing today that my future self will thank me for?",
"Am I willing to embrace uncertainty to discover my true potential?",
  // ... more quotes
];

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
  'Relationship': 'bg-teal-100 text-teal-800',
  'Spiritual': 'bg-blue-200 text-blue-800',
  default: 'bg-gray-100 text-gray-800'
};

const taskStatuses = ['Not Started', 'In Progress', 'Completed'];

// ===== SECTION 4: MAIN COMPONENT =====
export default function Page() {

  // ===== SECTION 4A: STATES =====
  const [years, setYears] = useState([])
  const [archivedGoals, setArchivedGoals] = useState([]);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiveViewOpen, setIsArchiveViewOpen] = useState(false);
  const [goalToArchive, setGoalToArchive] = useState(null);
  const [isSuccessJournalModalOpen, setIsSuccessJournalModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedGoalForTask, setSelectedGoalForTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'Not Started',
    dueDate: '',
    notes: ''
  });
  const [newGoal, setNewGoal] = useState({
    goal: '',
    category: 'Business',
    purpose: '',
    dueDate: '',
    progress: 0,
    status: 'in_progress',
    isArchived: false,
    archivedDate: null
  });

  const handleModalOpen = (type, goal = null) => {
    if (type === 'archiveView') {
      // Filter archived goals and set them to the state
      setArchivedGoals(goals.filter(goal => goal.isArchived));
      setIsArchiveViewOpen(true); // Open the archive view modal
    } else if (type === 'successJournal') {
      setIsSuccessJournalModalOpen(true);
    }
    
    setSelectedGoal(goal);
  };
  
  
// ===== SECTION 4B: EFFECTS =====

// Initial Data Fetch Effect
useEffect(() => {
  const fetchInitialData = async () => {
    await fetchTasks();
    await fetchGoals();
    getRandomQuote();
  };

  fetchInitialData();
}, []);

// Set unique years for Success Journal based on archived goals
useEffect(() => {
  const fetchArchivedGoals = async () => {
    try {
      // Fetch archived goals from the database
      const archivedGoalsSnapshot = await getDocs(collection(db, 'goals'));
      const archivedGoalsData = archivedGoalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isArchived: doc.data().isArchived || false // Ensure `isArchived` has a default value
      }));

      // Filter only archived goals
      const filteredArchivedGoals = archivedGoalsData.filter(goal => goal.isArchived);
      setArchivedGoals(filteredArchivedGoals);

      // Set unique years for the Success Journal based on archived goals
      const completedGoals = filteredArchivedGoals.filter(goal => goal.status === 'completed');
      const uniqueYears = [...new Set(completedGoals.map(goal => new Date(goal.archivedDate || goal.dueDate).getFullYear()))];
      setYears(uniqueYears);
    } catch (err) {
      console.error('Error fetching archived goals:', err);
    }
  };

  fetchArchivedGoals();
}, [archivedGoals]);



// ===== SECTION 4C: FUNCTIONS =====


  function ArchiveViewModal({ archivedGoals, handleModalClose, handleUnarchiveGoal, handleDeleteGoal }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Archived Goals</h2>
            <button 
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="space-y-4">
            {archivedGoals.length === 0 ? (
              <p className="text-gray-600">No archived goals available.</p>
            ) : (
              archivedGoals.map(goal => (
                <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{goal.goal}</h3>
                      <p className="text-gray-600 mt-1">{goal.purpose}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        Archived on: {new Date(goal.archivedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUnarchiveGoal(goal.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Unarchive
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
  

  const handleSuccessJournalClick = () => {
    setIsSuccessJournalModalOpen(true);
  };
  
  const closeSuccessJournalModal = () => {
    setIsSuccessJournalModalOpen(false);
  };
  
  const getCompletedGoalsByYear = (year) => {
    return archivedGoals.filter(
      goal => goal.status === 'completed' && new Date(goal.archivedDate || goal.dueDate).getFullYear() === year
    );
  };
  
  
  
  
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };
  

  const calculateGoalProgress = (goalId) => {
    const goalTasks = tasks.filter(task => task.goalId === goalId);
    if (goalTasks.length === 0) {
      return 0; // No tasks, progress is 0%
    }
    const completedTasks = goalTasks.filter(task => task.status === "Completed");
    const progress = Math.round((completedTasks.length / goalTasks.length) * 100);
    return progress;
  };
  
  
  const handleAddTaskClick = (goal) => {
    if (!goal) {
      console.error("Goal is not defined for adding task.");
      return;
    }
    setSelectedGoalForTask(goal);
    setIsAddTaskModalOpen(true);
  };

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      if (!selectedGoalForTask) {
        console.error("No goal selected for adding task");
        return;
      }
  
      const taskData = {
        ...newTask,
        goalId: selectedGoalForTask.id,
        created: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      setTasks(prev => [...prev, { id: docRef.id, ...taskData }]);
      
      // Update goal progress
      const newProgress = calculateGoalProgress(selectedGoalForTask.id);
      await updateProgress(selectedGoalForTask.id, newProgress);
  
      setIsAddTaskModalOpen(false);
      setNewTask({
        title: '',
        status: 'Not Started',
        dueDate: '',
        notes: ''
      });
      setSelectedGoalForTask(null);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    }
  };
  

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
  
      // Update the tasks state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
  
      // Find the updated task and calculate the goal progress
      const updatedTask = tasks.find(task => task.id === taskId);
      if (updatedTask) {
        const updatedGoalId = updatedTask.goalId;
  
        // Calculate the new progress after the task update
        const goalTasks = tasks
          .map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
          .filter(task => task.goalId === updatedGoalId);
  
        const completedTasks = goalTasks.filter(task => task.status === "Completed");
        const newProgress = Math.round((completedTasks.length / goalTasks.length) * 100);
        const updatedStatus = newProgress === 100 ? 'completed' : 'in_progress';
  
        // Update the goal in the database
        const goalRef = doc(db, 'goals', updatedGoalId);
        await updateDoc(goalRef, {
          progress: newProgress,
          status: updatedStatus
        });
  
        // Update the goals state
        setGoals(goals.map(goal =>
          goal.id === updatedGoalId
            ? { ...goal, progress: newProgress, status: updatedStatus }
            : goal
        ));
      }
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task status:', err);
    }
  };
  
  
  

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleViewDetails = (goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'goals'));
      const goalsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isArchived: doc.data().isArchived || false // Ensure isArchived has a default value
      }));
  
      setGoals(goalsData.filter(goal => !goal.isArchived));
      setArchivedGoals(goalsData.filter(goal => goal.isArchived));
    } catch (err) {
      setError('Failed to fetch goals');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  const handleDeleteArchivedGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      setArchivedGoals(archivedGoals.filter(goal => goal.id !== goalId));
      setIsArchiveViewOpen(false); // Close the modal
    } catch (err) {
      setError('Failed to delete goal');
      console.error('Error deleting goal:', err);
    }
  };
  
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...newGoal,
        created: new Date().toISOString(),
        progress: 0,
        status: 'in_progress',
        isArchived: false, // Explicitly set isArchived
        archivedDate: null // Explicitly set archivedDate
      };
  
      const docRef = await addDoc(collection(db, 'goals'), goalData);
      setGoals(prev => [...prev, { id: docRef.id, ...goalData }]);
      setIsModalOpen(false);
      setNewGoal({
        goal: '',
        category: 'Business',
        purpose: '',
        dueDate: '',
        progress: 0,
        status: 'in_progress',
        isArchived: false,
        archivedDate: null
      });
    } catch (err) {
      setError('Failed to add goal');
      console.error('Error adding goal:', err);
    }
  };

  const updateProgress = async (goalId, newProgress) => {
    try {
      const updatedStatus = newProgress >= 100 ? 'completed' : 'in_progress';
      
      // Update goals array
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          const updatedGoal = { 
            ...goal, 
            progress: newProgress, 
            status: updatedStatus 
          };
          
          // Show archive prompt if goal is completed
          if (updatedStatus === 'completed') {
            console.log('Goal completed, showing archive prompt'); // Debug log
            setGoalToArchive(updatedGoal);
            setIsArchiveModalOpen(true);
          }
          
          return updatedGoal;
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
        
        // Update local states
        setGoals(goals.filter(goal => goal.id !== goalId));
        setArchivedGoals(archivedGoals.filter(goal => goal.id !== goalId));
        
        // Close the archive modal if goal is deleted from archive view
        setIsArchiveViewOpen(false);
      } catch (err) {
        setError('Failed to delete goal');
        console.error('Error deleting goal:', err);
      }
    }
  };
  

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
    setIsArchiveViewOpen(false);  // Ensure archived goals modal closes
  };
  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalRef = doc(db, 'goals', editingGoal.id);
      await updateDoc(goalRef, {
        goal: editingGoal.goal,
        category: editingGoal.category,
        purpose: editingGoal.purpose,
        dueDate: editingGoal.dueDate
      });

      setGoals(goals.map(g => 
        g.id === editingGoal.id ? editingGoal : g
      ));
      setIsEditModalOpen(false);
      setEditingGoal(null);
    } catch (err) {
      setError('Failed to update goal');
      console.error('Error updating goal:', err);
    }
  };

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

  const handleArchiveGoal = async () => {
    if (!goalToArchive) return;
  
    try {
      const goalRef = doc(db, 'goals', goalToArchive.id);
      await updateDoc(goalRef, {
        isArchived: true,
        archivedDate: new Date().toISOString(),
        status: 'completed'
      });
  
      // Update the local goals state
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalToArchive.id));
      setArchivedGoals(prevArchived => [...prevArchived, { ...goalToArchive, isArchived: true }]);
      setIsArchiveModalOpen(false);
      setGoalToArchive(null);
    } catch (err) {
      setError('Failed to archive goal');
      console.error('Error archiving goal:', err);
    }
  };
  
  
  
  
  
  
  
  
  const handleUnarchiveGoal = async (goalId) => {
    try {
      const goalRef = doc(db, 'goals', goalId);
      const unarchiveData = {
        isArchived: false,
        archivedDate: null
      };
  
      await updateDoc(goalRef, unarchiveData);
  
      // Update local states
      const unarchivingGoal = archivedGoals.find(g => g.id === goalId);
      setArchivedGoals(prev => prev.filter(goal => goal.id !== goalId));
      setGoals(prev => [...prev, { ...unarchivingGoal, ...unarchiveData }]);
  
      setIsArchiveViewOpen(false);
    } catch (err) {
      setError('Failed to unarchive goal');
      console.error('Error unarchiving goal:', err);
    }
  };
  

  // Add this near your other modal components
const renderArchiveModal = () => (
  isArchiveModalOpen && goalToArchive && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
        <h2 className="text-2xl font-bold mb-4">Archive Completed Goal?</h2>
        <p className="text-gray-600 mb-6">
          Congratulations on completing "{goalToArchive.goal}"! Would you like to move this goal to the archive?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setIsArchiveModalOpen(false);
              setGoalToArchive(null);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Keep in Active Goals
          </button>
          <button
            onClick={handleArchiveGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Move to Archive
          </button>
        </div>
      </div>
    </div>
  )
);

const renderArchiveView = () => (
  isArchiveViewOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Archived Goals</h2>
          <button 
            onClick={() => setIsArchiveViewOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {archivedGoals.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No archived goals found.</p>
              <p className="text-sm text-gray-500 mt-1">
                Completed goals will appear here when you archive them.
              </p>
            </div>
          ) : (
            archivedGoals.map(goal => (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{goal.goal}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[goal.category] || categoryColors.default}`}>
                        {goal.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{goal.purpose}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Archived on:</span>{' '}
                        {new Date(goal.archivedDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span>{' '}
                        {new Date(goal.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Progress:</span>{' '}
                        {goal.progress}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUnarchiveGoal(goal.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Unarchive
                    </button>
                    <button 
                      onClick={() => handleEditClick(goal)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 hover:bg-red-50 rounded-full"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {/* Show Tasks if they exist */}
                {tasks.filter(task => task.goalId === goal.id).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Completed Tasks</h4>
                    <div className="space-y-2">
                      {tasks
                        .filter(task => task.goalId === goal.id)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between bg-white p-2 rounded">
                            <span className="text-sm">{task.title}</span>
                            <span className="text-sm text-gray-500">{task.status}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
);


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
  <div className="flex items-center gap-4">
    <button 
      onClick={() => setIsModalOpen(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      + Add Goal
    </button>
    <button
      onClick={handleSuccessJournalClick}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Success Journal
    </button>
    <button 
      onClick={() => setIsArchiveViewOpen(true)}
      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <Archive className="w-4 h-4" />
      View Archive
    </button>
  </div>
</div>

{/* Success Journal Modal */}
{isSuccessJournalModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Success Journal</h2>
        <button 
          onClick={closeSuccessJournalModal}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Year Filter Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
        <select
  value={selectedYear}
  onChange={handleYearChange}
  className="p-2 border rounded-md w-full"
>
  {years.length > 0 ? (
    years.map(year => (
      <option key={year} value={year}>{year}</option>
    ))
  ) : (
    <option value="">No Completed Goals Available</option>
  )}
</select>
      </div>

      {/* Display Completed Goals for the Selected Year */}
      <div className="space-y-4">
        {getCompletedGoalsByYear(selectedYear).length === 0 ? (
          <p className="text-gray-600">No achievements found for the selected year.</p>
        ) : (
          getCompletedGoalsByYear(selectedYear).map(goal => (
            <div key={goal.id} className="bg-gray-100 p-4 rounded-lg">
              <p className="font-medium">{goal.goal}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={closeSuccessJournalModal}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



{/* Archive Modal */}
{isArchiveModalOpen && goalToArchive && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Archive Completed Goal?</h2>
        <button 
          onClick={() => {
            setIsArchiveModalOpen(false);
            setGoalToArchive(null);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">
        Congratulations on completing "{goalToArchive.goal}"! Would you like to move this goal to the archive?
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            setIsArchiveModalOpen(false);
            setGoalToArchive(null);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Keep in Active Goals
        </button>
        <button
          onClick={handleArchiveGoal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Move to Archive
        </button>
      </div>
    </div>
  </div>
)}


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

      {/* Motivational Quote Card */}
      <div className="mb-8 bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-lg shadow-sm text-white">
  <div className="flex justify-between items-start">
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-white mb-3">Daily Reflection</h2>
      <p className="text-lg font-medium text-white/90 leading-relaxed">
        "{currentQuote}"
      </p>
    </div>
    <button 
      onClick={getRandomQuote}
      className="p-2 hover:bg-blue-600/50 rounded-full transition-all"
      title="Get new quote"
    >
      <RefreshCw className="w-5 h-5 text-white" />
    </button>
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
                  backgroundColor: 'rgba(59, 130, 246, 0.6)', // Stronger blue
                },
                {
                  label: 'Completed',
                  data: categories.map(category => 
                    goals.filter(g => g.category === category && g.status === 'completed').length
                  ),
                  backgroundColor: 'rgba(16, 185, 129, 0.6)', // Stronger green
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
                  // Only show categories with goals
                  labels: categories.filter(category => 
                    goals.filter(g => g.category === category).length > 0
                  ),
                  datasets: [{
                    data: categories
                      .filter(category => goals.filter(g => g.category === category).length > 0)
                      .map(category => goals.filter(g => g.category === category).length),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',   // Business - Light blue
                      'rgba(147, 51, 234, 0.7)',   // Community Service - Light purple
                      'rgba(236, 72, 153, 0.7)',   // Family - Light pink
                      'rgba(79, 70, 229, 0.7)',    // Investments - Light indigo
                      'rgba(245, 158, 11, 0.7)',   // Personal Growth - Light amber
                      'rgba(20, 184, 166, 0.7)',   // Spiritual - Light teal
                      'rgba(239, 68, 68, 0.7)',    // Additional colors if needed
                      'rgba(168, 85, 247, 0.7)',
                      'rgba(251, 146, 60, 0.7)',
                      'rgba(14, 165, 233, 0.7)'
                    ],
                    borderWidth: 2,
                    borderColor: 'white'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      display: true,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12
                        },
                        generateLabels: (chart) => {
                          const datasets = chart.data.datasets;
                          const data = datasets[0].data;
                          return chart.data.labels.map((label, i) => ({
                            text: `${label} (${data[i]})`,
                            fillStyle: datasets[0].backgroundColor[i],
                            index: i
                          }));
                        }
                      }
                    },
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value} goal${value !== 1 ? 's' : ''}`;
                        }
                      }
                    }
                  },
                  cutout: '60%'
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


{/* Goals List Section */}
<div className="space-y-4">
  {goals
    .filter(goal => (selectedCategory === 'All' || goal.category === selectedCategory) && !goal.isArchived)
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
            {/* Edit Button */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => handleEditClick(goal)}
              title="Edit Goal"
              aria-label={`Edit goal: ${goal.goal}`}
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
            </button>
            {/* Archive Button */}
            <button
              className="p-2 hover:bg-yellow-50 rounded-full"
              onClick={() => {
                setGoalToArchive(goal);
                setIsArchiveModalOpen(true);
              }}
              title="Archive Goal"
              aria-label={`Archive goal: ${goal.goal}`}
            >
              <Archive className="w-5 h-5 text-yellow-600" />
            </button>
            {/* Delete Button */}
            <button
              className="p-2 hover:bg-red-50 rounded-full"
              onClick={() => deleteGoal(goal.id)}
              title="Delete Goal"
              aria-label={`Delete goal: ${goal.goal}`}
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Progress Section */}
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

        {/* Action Buttons Section */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => updateProgress(goal.id, Math.min(goal.progress + 10, 100))}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            title="Update Progress by 10%"
            aria-label={`Update progress for goal: ${goal.goal}`}
          >
            Update Progress
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewDetails(goal)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            title="View Goal Details"
            aria-label={`View details of goal: ${goal.goal}`}
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tasks Section */}
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Tasks</h4>
            <button
              onClick={() => handleAddTaskClick(goal)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ListTodo className="w-4 h-4" />
              Add Task
            </button>
          </div>
          {tasks.filter(task => task.goalId === goal.id).length === 0 ? (
            <div className="text-sm text-gray-500">No tasks found for this goal. Click "Add Task" to create a new task.</div>
          ) : (
            <div className="space-y-2">
              {tasks
                .filter(task => task.goalId === goal.id)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-sm border-none bg-transparent"
                      >
                        {taskStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    ))}

  {goals.filter(goal => !goal.isArchived).length === 0 && (
    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-600">
        No active goals found. Click the "Add Goal" button to create your first goal!
      </p>
    </div>
  )}
</div>


      {/* Add Goal Modal Section */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      {/* Add Task Modal Section */}
      {isAddTaskModalOpen && selectedGoalForTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Task</h2>
              <button 
                onClick={() => {
                  setIsAddTaskModalOpen(false);
                  setSelectedGoalForTask(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {taskStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTaskModalOpen(false);
                    setSelectedGoalForTask(null);
                  }}
                  className="flex-1 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Edit Goal Modal */}
{isEditModalOpen && editingGoal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Goal</h2>
        <div className="flex items-center gap-2">
          {/* Archive button */}
          <button 
            onClick={() => {
              setGoalToArchive(editingGoal);
              setIsArchiveModalOpen(true);
              setIsEditModalOpen(false);
            }}
            className="p-2 hover:bg-yellow-50 rounded-full"
            title="Archive Goal"
          >
            <Archive className="w-6 h-6 text-yellow-600" />
          </button>
          {/* Close button */}
          <button 
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingGoal(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goal Title
          </label>
          <input
            type="text"
            value={editingGoal.goal}
            onChange={(e) => setEditingGoal({
              ...editingGoal,
              goal: e.target.value
            })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={editingGoal.category}
            onChange={(e) => setEditingGoal({
              ...editingGoal,
              category: e.target.value
            })}
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
            value={editingGoal.purpose}
            onChange={(e) => setEditingGoal({
              ...editingGoal,
              purpose: e.target.value
            })}
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
            value={editingGoal.dueDate}
            onChange={(e) => setEditingGoal({
              ...editingGoal,
              dueDate: e.target.value
            })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingGoal(null);
            }}
            className="flex-1 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Goal Details Modal */}
      {isDetailsModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Goal Details</h2>
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedGoal(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Goal Title */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedGoal.goal}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[selectedGoal.category] || categoryColors.default}`}> {selectedGoal.category}
                </span>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose
                </label>
                <p className="text-gray-600">{selectedGoal.purpose}</p>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress
                </label>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${selectedGoal.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedGoal.progress}% Complete</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created On
                  </label>
                  <p className="text-gray-600">
                    {new Date(selectedGoal.created).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <p className="text-gray-600">
                    {new Date(selectedGoal.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedGoal.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedGoal.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedGoal(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
          {renderArchiveModal()}
          {renderArchiveView()}
    </div>
  );
}
