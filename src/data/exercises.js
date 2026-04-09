const exerciseData = [
  // Chest
  { name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { name: 'Incline Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { name: 'Decline Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: 'Dumbbell' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell' },
  { name: 'Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell' },
  { name: 'Cable Fly', muscle: 'Chest', equipment: 'Cable' },
  { name: 'Push Up', muscle: 'Chest', equipment: 'Bodyweight' },
  { name: 'Chest Dip', muscle: 'Chest', equipment: 'Bodyweight' },
  { name: 'Machine Chest Press', muscle: 'Chest', equipment: 'Machine' },
  { name: 'Pec Deck', muscle: 'Chest', equipment: 'Machine' },

  // Back
  { name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell' },
  { name: 'Deadlift', muscle: 'Back', equipment: 'Barbell' },
  { name: 'Pull Up', muscle: 'Back', equipment: 'Bodyweight' },
  { name: 'Chin Up', muscle: 'Back', equipment: 'Bodyweight' },
  { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
  { name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable' },
  { name: 'Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell' },
  { name: 'T-Bar Row', muscle: 'Back', equipment: 'Barbell' },
  { name: 'Face Pull', muscle: 'Back', equipment: 'Cable' },
  { name: 'Hyperextension', muscle: 'Back', equipment: 'Bodyweight' },

  // Shoulders
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Front Raise', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Reverse Fly', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', equipment: 'Cable' },
  { name: 'Upright Row', muscle: 'Shoulders', equipment: 'Barbell' },

  // Biceps
  { name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell' },
  { name: 'Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Preacher Curl', muscle: 'Biceps', equipment: 'Barbell' },
  { name: 'Cable Curl', muscle: 'Biceps', equipment: 'Cable' },
  { name: 'Concentration Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
  { name: 'Incline Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell' },

  // Triceps
  { name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable' },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', equipment: 'Dumbbell' },
  { name: 'Skull Crusher', muscle: 'Triceps', equipment: 'Barbell' },
  { name: 'Close Grip Bench Press', muscle: 'Triceps', equipment: 'Barbell' },
  { name: 'Tricep Dip', muscle: 'Triceps', equipment: 'Bodyweight' },
  { name: 'Cable Overhead Extension', muscle: 'Triceps', equipment: 'Cable' },

  // Quads
  { name: 'Barbell Squat', muscle: 'Quads', equipment: 'Barbell' },
  { name: 'Front Squat', muscle: 'Quads', equipment: 'Barbell' },
  { name: 'Leg Press', muscle: 'Quads', equipment: 'Machine' },
  { name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine' },
  { name: 'Goblet Squat', muscle: 'Quads', equipment: 'Dumbbell' },
  { name: 'Hack Squat', muscle: 'Quads', equipment: 'Machine' },
  { name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'Dumbbell' },
  { name: 'Lunge', muscle: 'Quads', equipment: 'Dumbbell' },

  // Hamstrings
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Leg Curl', muscle: 'Hamstrings', equipment: 'Machine' },
  { name: 'Stiff Leg Deadlift', muscle: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Good Morning', muscle: 'Hamstrings', equipment: 'Barbell' },

  // Glutes
  { name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell' },
  { name: 'Cable Kickback', muscle: 'Glutes', equipment: 'Cable' },
  { name: 'Glute Bridge', muscle: 'Glutes', equipment: 'Bodyweight' },

  // Calves
  { name: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Machine' },
  { name: 'Seated Calf Raise', muscle: 'Calves', equipment: 'Machine' },

  // Abs
  { name: 'Crunch', muscle: 'Abs', equipment: 'Bodyweight' },
  { name: 'Hanging Leg Raise', muscle: 'Abs', equipment: 'Bodyweight' },
  { name: 'Cable Crunch', muscle: 'Abs', equipment: 'Cable' },
  { name: 'Plank', muscle: 'Abs', equipment: 'Bodyweight' },
  { name: 'Ab Wheel Rollout', muscle: 'Abs', equipment: 'Other' },
  { name: 'Russian Twist', muscle: 'Abs', equipment: 'Bodyweight' },

  // Traps
  { name: 'Barbell Shrug', muscle: 'Traps', equipment: 'Barbell' },
  { name: 'Dumbbell Shrug', muscle: 'Traps', equipment: 'Dumbbell' },
];

export const defaultExercises = exerciseData.map((ex, i) => ({
  id: `ex_${i + 1}`,
  ...ex,
  isCustom: false,
}));
