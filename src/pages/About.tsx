// About page - Information about the app
import { type FC } from 'react';

const About: FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">About</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Habit Tracker is a powerful tool to help you build and maintain positive habits.
      </p>
      <div className="space-y-2 text-gray-600 dark:text-gray-400">
        <p><strong>Features:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Track daily habits</li>
          <li>View streak statistics</li>
          <li>Earn badges for achievements</li>
          <li>Monthly heatmap visualization</li>
          <li>Dark/Light theme support</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
