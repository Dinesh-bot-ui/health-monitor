"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { EXERCISE_TYPES, type HealthFormData } from "@/lib/health-data"

type Props = {
  formData: HealthFormData
  updateFormData: (updates: Partial<HealthFormData>) => void
}

export function LifestyleSection({ formData, updateFormData }: Props) {
  const toggleExerciseType = (type: string) => {
    const current = formData.exerciseType
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    updateFormData({ exerciseType: updated })
  }

  return (
    <div className="space-y-6">
      {/* Exercise */}
      <div className="space-y-4">
        <Label>Do you exercise regularly?</Label>
        <RadioGroup
          value={formData.doesExercise === null ? '' : formData.doesExercise ? 'yes' : 'no'}
          onValueChange={(value) => updateFormData({ doesExercise: value === 'yes' })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="exercise-yes" />
            <Label htmlFor="exercise-yes" className="font-normal cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="exercise-no" />
            <Label htmlFor="exercise-no" className="font-normal cursor-pointer">No</Label>
          </div>
        </RadioGroup>

        {formData.doesExercise === true && (
          <div className="pl-4 border-l-2 border-primary/30 space-y-4">
            <div className="space-y-2">
              <Label>Exercise Type (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXERCISE_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exercise-${type}`}
                      checked={formData.exerciseType.includes(type)}
                      onCheckedChange={() => toggleExerciseType(type)}
                    />
                    <Label htmlFor={`exercise-${type}`} className="font-normal cursor-pointer">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exerciseDuration">Duration (minutes/day)</Label>
              <Input
                id="exerciseDuration"
                type="number"
                placeholder="e.g., 30"
                value={formData.exerciseDuration ?? ''}
                onChange={(e) => updateFormData({ exerciseDuration: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>
        )}

        {formData.doesExercise === false && (
          <div className="pl-4 border-l-2 border-primary/30 space-y-2">
            <Label htmlFor="noExerciseReason">Reason (optional)</Label>
            <Textarea
              id="noExerciseReason"
              placeholder="Why don't you exercise?"
              value={formData.noExerciseReason}
              onChange={(e) => updateFormData({ noExerciseReason: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Diet */}
      <div className="space-y-2">
        <Label>Diet Type</Label>
        <RadioGroup
          value={formData.dietType ?? ''}
          onValueChange={(value) => updateFormData({ dietType: value as HealthFormData['dietType'] })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="veg" id="diet-veg" />
            <Label htmlFor="diet-veg" className="font-normal cursor-pointer">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-veg" id="diet-nonveg" />
            <Label htmlFor="diet-nonveg" className="font-normal cursor-pointer">Non-Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mixed" id="diet-mixed" />
            <Label htmlFor="diet-mixed" className="font-normal cursor-pointer">Mixed</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Junk Food */}
      <div className="space-y-2">
        <Label>Junk Food Frequency</Label>
        <RadioGroup
          value={formData.junkFoodFrequency ?? ''}
          onValueChange={(value) => updateFormData({ junkFoodFrequency: value as HealthFormData['junkFoodFrequency'] })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="never" id="junk-never" />
            <Label htmlFor="junk-never" className="font-normal cursor-pointer">Never</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="junk-weekly" />
            <Label htmlFor="junk-weekly" className="font-normal cursor-pointer">Weekly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="junk-daily" />
            <Label htmlFor="junk-daily" className="font-normal cursor-pointer">Daily</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Water & Sleep */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="waterIntake">Water Intake (litres/day)</Label>
          <Input
            id="waterIntake"
            type="number"
            step="0.5"
            placeholder="e.g., 2.5"
            value={formData.waterIntake ?? ''}
            onChange={(e) => updateFormData({ waterIntake: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleepHours">Sleep (hours/day)</Label>
          <Input
            id="sleepHours"
            type="number"
            step="0.5"
            placeholder="e.g., 7"
            value={formData.sleepHours ?? ''}
            onChange={(e) => updateFormData({ sleepHours: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="space-y-2">
        <Label>Sleep Quality</Label>
        <RadioGroup
          value={formData.sleepQuality ?? ''}
          onValueChange={(value) => updateFormData({ sleepQuality: value as HealthFormData['sleepQuality'] })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="good" id="sleep-good" />
            <Label htmlFor="sleep-good" className="font-normal cursor-pointer">Good</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="average" id="sleep-average" />
            <Label htmlFor="sleep-average" className="font-normal cursor-pointer">Average</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="poor" id="sleep-poor" />
            <Label htmlFor="sleep-poor" className="font-normal cursor-pointer">Poor</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Smoking & Alcohol */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Smoking</Label>
          <RadioGroup
            value={formData.smoking === null ? '' : formData.smoking ? 'yes' : 'no'}
            onValueChange={(value) => updateFormData({ smoking: value === 'yes' })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="smoking-yes" />
              <Label htmlFor="smoking-yes" className="font-normal cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="smoking-no" />
              <Label htmlFor="smoking-no" className="font-normal cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Alcohol</Label>
          <RadioGroup
            value={formData.alcohol ?? ''}
            onValueChange={(value) => updateFormData({ alcohol: value as HealthFormData['alcohol'] })}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="alcohol-never" />
              <Label htmlFor="alcohol-never" className="font-normal cursor-pointer">Never</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="occasionally" id="alcohol-occasionally" />
              <Label htmlFor="alcohol-occasionally" className="font-normal cursor-pointer">Occasionally</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regular" id="alcohol-regular" />
              <Label htmlFor="alcohol-regular" className="font-normal cursor-pointer">Regular</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Additional fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stepsPerDay">Steps per Day</Label>
          <Input
            id="stepsPerDay"
            type="number"
            placeholder="e.g., 8001"
            value={formData.stepsPerDay ?? ''}
            onChange={(e) => updateFormData({ stepsPerDay: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="screenTime">Screen Time (hours)</Label>
          <Input
            id="screenTime"
            type="number"
            placeholder="e.g., 6"
            value={formData.screenTime ?? ''}
            onChange={(e) => updateFormData({ screenTime: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Work Type</Label>
          <RadioGroup
            value={formData.workType ?? ''}
            onValueChange={(value) => updateFormData({ workType: value as HealthFormData['workType'] })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sedentary" id="work-sedentary" />
              <Label htmlFor="work-sedentary" className="font-normal cursor-pointer">Sedentary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="work-active" />
              <Label htmlFor="work-active" className="font-normal cursor-pointer">Active</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (City)</Label>
          <Input
            id="location"
            placeholder="Your city"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
