"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { HealthFormData } from "@/lib/health-data"

type Props = {
  formData: HealthFormData
  updateFormData: (updates: Partial<HealthFormData>) => void
}

export function VitalSignsSection({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="heartRate">Resting Heart Rate (bpm)</Label>
        <Input
          id="heartRate"
          type="number"
          placeholder="e.g., 72"
          value={formData.restingHeartRate ?? ''}
          onChange={(e) => updateFormData({ restingHeartRate: e.target.value ? Number(e.target.value) : null })}
        />
        <p className="text-xs text-muted-foreground">Normal range: 60-100 bpm</p>
      </div>

      <div className="space-y-2">
        <Label>Blood Pressure (mmHg)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Systolic (upper)"
              value={formData.bloodPressureSystolic ?? ''}
              onChange={(e) => updateFormData({ bloodPressureSystolic: e.target.value ? Number(e.target.value) : null })}
            />
            <p className="text-xs text-muted-foreground mt-1">Normal: 90-120</p>
          </div>
          <div>
            <Input
              type="number"
              placeholder="Diastolic (lower)"
              value={formData.bloodPressureDiastolic ?? ''}
              onChange={(e) => updateFormData({ bloodPressureDiastolic: e.target.value ? Number(e.target.value) : null })}
            />
            <p className="text-xs text-muted-foreground mt-1">Normal: 60-80</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Blood Sugar (mg/dL)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fastingSugar" className="text-xs text-muted-foreground">Fasting</Label>
            <Input
              id="fastingSugar"
              type="number"
              placeholder="Fasting level"
              value={formData.bloodSugarFasting ?? ''}
              onChange={(e) => updateFormData({ bloodSugarFasting: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div>
            <Label htmlFor="postMealSugar" className="text-xs text-muted-foreground">Post-meal (optional)</Label>
            <Input
              id="postMealSugar"
              type="number"
              placeholder="After meal"
              value={formData.bloodSugarPostMeal ?? ''}
              onChange={(e) => updateFormData({ bloodSugarPostMeal: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spo2">SpO2 (%)</Label>
        <Input
          id="spo2"
          type="number"
          placeholder="Blood oxygen level"
          value={formData.spO2 ?? ''}
          onChange={(e) => updateFormData({ spO2: e.target.value ? Number(e.target.value) : null })}
        />
        <p className="text-xs text-muted-foreground">Normal range: 95-100%</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Body Temperature</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">°C</span>
            <Switch
              checked={formData.temperatureUnit === 'fahrenheit'}
              onCheckedChange={(checked) => updateFormData({ temperatureUnit: checked ? 'fahrenheit' : 'celsius' })}
            />
            <span className="text-sm text-muted-foreground">°F</span>
          </div>
        </div>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          placeholder={formData.temperatureUnit === 'celsius' ? 'e.g., 37.0' : 'e.g., 98.6'}
          value={formData.bodyTemperature ?? ''}
          onChange={(e) => updateFormData({ bodyTemperature: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  )
}
