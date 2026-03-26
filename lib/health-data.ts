export type HealthFormData = {
  // Section 1: Basic Information
  fullName: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null

  // Section 2: Vital Signs
  restingHeartRate: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  bloodSugarFasting: number | null
  bloodSugarPostMeal: number | null
  spO2: number | null
  bodyTemperature: number | null
  temperatureUnit: 'celsius' | 'fahrenheit'

  // Section 3: Lifestyle & Habits
  doesExercise: boolean | null
  exerciseType: string[]
  exerciseDuration: number | null
  noExerciseReason: string
  dietType: 'veg' | 'non-veg' | 'mixed' | null
  junkFoodFrequency: 'never' | 'weekly' | 'daily' | null
  waterIntake: number | null
  sleepHours: number | null
  sleepQuality: 'good' | 'average' | 'poor' | null
  smoking: boolean | null
  alcohol: 'never' | 'occasionally' | 'regular' | null

  // Section 4: Medical History
  existingConditions: string[]
  conditionSeverity: Record<string, 'mild' | 'moderate' | 'severe'>
  conditionDuration: Record<string, string>
  familyHeartDisease: boolean | null
  familyDiabetes: boolean | null
  familyHighBP: boolean | null
  currentMedications: string
  allergies: string

  // Section 5: Symptoms & Mental Health
  chestPain: boolean | null
  shortnessOfBreath: boolean | null
  dizziness: boolean | null
  fatigue: boolean | null
  stressLevel: number
  anxiety: 'never' | 'sometimes' | 'often' | null
  mood: 'happy' | 'neutral' | 'low' | null

  // Additional Fields
  stepsPerDay: number | null
  screenTime: number | null
  workType: 'sedentary' | 'active' | null
  location: string
}

export const initialHealthFormData: HealthFormData = {
  fullName: '',
  age: null,
  gender: null,
  height: null,
  weight: null,
  restingHeartRate: null,
  bloodPressureSystolic: null,
  bloodPressureDiastolic: null,
  bloodSugarFasting: null,
  bloodSugarPostMeal: null,
  spO2: null,
  bodyTemperature: null,
  temperatureUnit: 'celsius',
  doesExercise: null,
  exerciseType: [],
  exerciseDuration: null,
  noExerciseReason: '',
  dietType: null,
  junkFoodFrequency: null,
  waterIntake: null,
  sleepHours: null,
  sleepQuality: null,
  smoking: null,
  alcohol: null,
  existingConditions: [],
  conditionSeverity: {},
  conditionDuration: {},
  familyHeartDisease: null,
  familyDiabetes: null,
  familyHighBP: null,
  currentMedications: '',
  allergies: '',
  chestPain: null,
  shortnessOfBreath: null,
  dizziness: null,
  fatigue: null,
  stressLevel: 3,
  anxiety: null,
  mood: null,
  stepsPerDay: null,
  screenTime: null,
  workType: null,
  location: ''
}

export const FORM_SECTIONS = [
  { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
  { id: 2, title: 'Vital Signs', description: 'Your core health indicators' },
  { id: 3, title: 'Lifestyle & Habits', description: 'Your daily routine and habits' },
  { id: 4, title: 'Medical History', description: 'Past and ongoing health conditions' },
  { id: 5, title: 'Symptoms & Mental Health', description: 'Current symptoms and mental wellness' },
] as const

export const EXERCISE_TYPES = ['Walking', 'Gym', 'Yoga', 'Sports', 'Running', 'Swimming']
export const MEDICAL_CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid', 'Asthma', 'None']
