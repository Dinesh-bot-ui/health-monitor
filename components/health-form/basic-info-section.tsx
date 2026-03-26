"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { HealthFormData } from "@/lib/health-data"

type Props = {
  formData: HealthFormData
  updateFormData: (updates: Partial<HealthFormData>) => void
}

export function BasicInfoSection({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Years"
            value={formData.age ?? ''}
            onChange={(e) => updateFormData({ age: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={formData.gender ?? ''}
            onValueChange={(value) => updateFormData({ gender: value as HealthFormData['gender'] })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="Height in cm"
            value={formData.height ?? ''}
            onChange={(e) => updateFormData({ height: e.target.value ? Number(e.target.value) : null })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Weight in kg"
            value={formData.weight ?? ''}
            onChange={(e) => updateFormData({ weight: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      {formData.height && formData.weight && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">Your BMI</p>
          <p className="text-2xl font-bold text-primary">
            {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {getBMICategory(formData.weight / Math.pow(formData.height / 100, 2))}
          </p>
        </div>
      )}
    </div>
  )
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Normal weight"
  if (bmi < 30) return "Overweight"
  return "Obese"
}
