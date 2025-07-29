'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  ProgressCircle,
  WorkoutCard,
  PersonalRecordCard,
  CalendarWidget,
  Button
} from '@/components/ui';

/**
 * Dashboard Preview Component
 * Demonstrates the new design system components matching the mockup
 */
export default function DashboardPreview() {
  // Sample data
  const workoutDates = [
    '2024-01-15',
    '2024-01-17',
    '2024-01-19',
    '2024-01-22',
    '2024-01-24',
    '2024-01-26',
    '2024-01-29',
  ];

  const recentWorkouts = [
    {
      title: 'Push Day',
      type: 'Strength Training',
      duration: '45 min',
      calories: 320,
      date: 'Today',
      image: '/workout-1.jpg'
    },
    {
      title: 'Pull Day',
      type: 'Strength Training', 
      duration: '50 min',
      calories: 380,
      date: 'Yesterday',
      image: '/workout-2.jpg'
    },
    {
      title: 'Push Day',
      type: 'Strength Training',
      duration: '42 min', 
      calories: 295,
      date: '2 days ago',
      image: '/workout-3.jpg'
    }
  ];

  const personalRecords = [
    {
      title: 'Bench Press',
      value: 225,
      unit: 'lbs',
      target: 250,
      change: { value: 10, type: 'increase' as const, period: 'this week' }
    },
    {
      title: 'Deadlift', 
      value: 315,
      unit: 'lbs',
      target: 350,
      change: { value: 15, type: 'increase' as const, period: 'this month' }
    },
    {
      title: 'Squat',
      value: 275,
      unit: 'lbs',
      target: 300,
      change: { value: 5, type: 'increase' as const, period: 'this week' }
    }
  ];

  return (
    <div className="container-app pb-8">
      <div className="mb-8">
        <h1 className="heading-xl mb-2">Hello, Juan</h1>
        <p className="text-body">Ready to crush your fitness goals today?</p>
      </div>

      {/* Progress Tracker Section */}
      <div className="mb-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>July Progress Tracker</CardTitle>
            <p className="text-caption">Workout completion this month</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <ProgressCircle
                current={22}
                target={22}
                size={160}
                strokeWidth={12}
                color="primary"
                label="workouts"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-text-primary font-semibold">22</div>
                <div className="text-caption">Workouts</div>
              </div>
              <div>
                <div className="text-text-primary font-semibold">8.5k</div>
                <div className="text-caption">Calories</div>
              </div>
              <div>
                <div className="text-text-primary font-semibold">16h</div>
                <div className="text-caption">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid-dashboard">
        {/* Calendar Widget */}
        <div className="lg:col-span-1">
          <CalendarWidget 
            workoutDates={workoutDates}
            onDateSelect={(date) => console.log('Selected date:', date)}
          />
        </div>

        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Workouts</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentWorkouts.map((workout, index) => (
                <WorkoutCard
                  key={index}
                  {...workout}
                  onClick={() => console.log('Workout clicked:', workout.title)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Personal Records */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-lg">Personal Records</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personalRecords.map((record, index) => (
            <PersonalRecordCard
              key={index}
              {...record}
            />
          ))}
        </div>
      </div>

      {/* Before & After Photos Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Before & After Photos</CardTitle>
            <p className="text-body">Track your visual progress over time</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-ui-hover rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-text-tertiary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-caption">Add Before Photo</p>
                </div>
              </div>
              <div className="aspect-square bg-ui-hover rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-text-tertiary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-caption">Add After Photo</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="primary">Upload Photos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
