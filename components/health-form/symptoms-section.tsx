"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import type { HealthFormData } from "@/lib/health-data"

type Props = {
  formData: HealthFormData
  updateFormData: (updates: Partial<HealthFormData>) => void
}

export function SymptomsSection({ formData, updateFormData }: Props) {
  const symptoms = [
    { key: 'chestPain' as const, label: 'Chest Pain' },
    { key: 'shortnessOfBreath' as const, label: 'Shortness of Breath' },
    { key: 'dizziness' as const, label: 'Dizziness' },
    { key: 'fatigue' as const, label: 'Fatigue' },
  ]

  const stressLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']

  return (
    <div className="space-y-6">
      {/* Physical Symptoms */}
      <div className="space-y-4">
        <Label>Physical Symptoms</Label>
        <p className="text-sm text-muted-foreground">Do you experience any of the following?</p>
        
        <div className="space-y-3">
          {symptoms.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">{label}</span>
              <RadioGroup
                value={formData[key] === null ? '' : formData[key] ? 'yes' : 'no'}
                onValueChange={(value) => updateFormData({ [key]: value === 'yes' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${key}-yes`} />
                  <Label htmlFor={`${key}-yes`} className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${key}-no`} />
                  <Label htmlFor={`${key}-no`} className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Health */}
      <div className="space-y-6">
        <Label>Mental Health</Label>
        
        {/* Stress Level */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Stress Level</span>
            <span className="text-sm font-medium text-primary">
              {stressLabels[formData.stressLevel - 1]}
            </span>
          </div>
          <Slider
            value={[formData.stressLevel]}
            onValueChange={([value]) => updateFormData({ stressLevel: value })}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Anxiety */}
        <div className="space-y-2">
          <Label>Do you experience anxiety?</Label>
          <RadioGroup
            value={formData.anxiety ?? ''}
            onValueChange={(value) => updateFormData({ anxiety: value as HealthFormData['anxiety'] })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="anxiety-never" />
              <Label htmlFor="anxiety-never" className="font-normal cursor-pointer">Never</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sometimes" id="anxiety-sometimes" />
              <Label htmlFor="anxiety-sometimes" className="font-normal cursor-pointer">Sometimes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="often" id="anxiety-often" />
              <Label htmlFor="anxiety-often" className="font-normal cursor-pointer">Often</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <Label>Current Mood</Label>
          <RadioGroup
            value={formData.mood ?? ''}
            onValueChange={(value) => updateFormData({ mood: value as HealthFormData['mood'] })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="happy" id="mood-happy" />
              <Label htmlFor="mood-happy" className="font-normal cursor-pointer">Happy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="mood-neutral" />
              <Label htmlFor="mood-neutral" className="font-normal cursor-pointer">Neutral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="mood-low" />
              <Label htmlFor="mood-low" className="font-normal cursor-pointer">Low</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <h4 className="font-medium mb-2">Almost Done!</h4>
        <p className="text-sm text-muted-foreground">
          After submitting this form, you&apos;ll be taken to your personalized health dashboard 
          where you can view your health metrics, track progress, and get AI-powered insights.
        </p>
      </div>
    </div>
  )
}
