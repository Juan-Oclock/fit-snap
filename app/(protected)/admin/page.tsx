import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | FitSnap',
  description: 'Manage exercises, categories, muscle groups, and quotes',
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-yellow-500">Admin access only. This page is restricted to administrators.</p>
      
      <div className="flex overflow-x-auto mb-4">
        <div className="flex space-x-2">
          {["Exercises", "Categories", "Muscle Groups", "Quotes"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 whitespace-nowrap ${
                tab === "Exercises" 
                  ? "bg-primary text-black font-medium rounded-t-lg" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Exercises</h2>
          <button className="btn-primary">Add New Exercise</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-700">
              <tr>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Muscle Group</th>
                <th className="text-left py-3 px-4">Equipment</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {[
                { id: 1, name: "Bench Press", category: "Strength", muscle: "Chest", equipment: "Barbell" },
                { id: 2, name: "Pull-ups", category: "Strength", muscle: "Back", equipment: "Body Weight" },
                { id: 3, name: "Squats", category: "Strength", muscle: "Legs", equipment: "Barbell" },
                { id: 4, name: "Running", category: "Cardio", muscle: "Full Body", equipment: "None" },
              ].map((exercise) => (
                <tr key={exercise.id}>
                  <td className="py-3 px-4">{exercise.name}</td>
                  <td className="py-3 px-4">{exercise.category}</td>
                  <td className="py-3 px-4">{exercise.muscle}</td>
                  <td className="py-3 px-4">{exercise.equipment}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded bg-dark-700">1</button>
            <button className="px-3 py-1 rounded hover:bg-dark-700">2</button>
            <button className="px-3 py-1 rounded hover:bg-dark-700">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
