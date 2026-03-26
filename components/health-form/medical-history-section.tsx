"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MEDICAL_CONDITIONS, type HealthFormData } from "@/lib/health-data"

type Props = {
  formData: HealthFormData
  updateFormData: (updates: Partial<HealthFormData>) => void
}

export function MedicalHistorySection({ formData, updateFormData }: Props) {
  const toggleCondition = (condition: string) => {
    const current = formData.existingConditions
    let updated: string[]
    
    if (condition === 'None') {
      updated = current.includes('None') ? [] : ['None']
    } else {
      updated = current.includes(condition)
        ? current.filter(c => c !== condition)
        : [...current.filter(c => c !== 'None'), condition]
    }
    updateFormData({ existingConditions: updated })
  }

  const updateSeverity = (condition: string, severity: 'mild' | 'moderate' | 'severe') => {
    updateFormData({
      conditionSeverity: { ...formData.conditionSeverity, [condition]: severity }
    })
  }

  const updateDuration = (condition: string, duration: string) => {
    updateFormData({
      conditionDuration: { ...formData.conditionDuration, [condition]: duration }
    })
  }

  const hasConditions = formData.existingConditions.length > 0 && !formData.existingConditions.includes('None')

  return (
    <div className="space-y-6">
      {/* Existing Conditions */}
      <div className="space-y-4">
        <Label>Existing Medical Conditions</Label>
        <div className="grid grid-cols-2 gap-2">
          {MEDICAL_CONDITIONS.map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${condition}`}
                checked={formData.existingConditions.includes(condition)}
                onCheckedChange={() => toggleCondition(condition)}
              />
              <Label htmlFor={`condition-${condition}`} className="font-normal cursor-pointer">{condition}</Label>
            </div>
          ))}
        </div>

        {hasConditions && (
          <div className="pl-4 border-l-2 border-primary/30 space-y-4">
            {formData.existingConditions.filter(c => c !== 'None').map((condition) => (
              <div key={condition} className="space-y-3 p-3 rounded-lg bg-muted/50">
                <p className="font-medium text-sm">{condition}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Severity</Label>
                    <Select
                      value={formData.conditionSeverity[condition] ?? ''}
                      onValueChange={(value) => updateSeverity(condition, value as 'mild' | 'moderate' | 'severe')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Duration</Label>
                    <Input
                      placeholder="e.g., 2 years"
                      value={formData.conditionDuration[condition] ?? ''}
                      onChange={(e) => updateDuration(condition, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family History */}
      <div className="space-y-4">
        <Label>Family History</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Heart Disease in Family</span>
            <RadioGroup
              value={formData.familyHeartDisease === null ? '' : formData.familyHeartDisease ? 'yes' : 'no'}
              onValueChange={(value) => updateFormData({ familyHeartDisease: value === 'yes' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="family-heart-yes" />
                <Label htmlFor="family-heart-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="family-heart-no" />
                <Label htmlFor="family-heart-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Diabetes in Family</span>
            <RadioGroup
              value={formData.familyDiabetes === null ? '' : formData.familyDiabetes ? 'yes' : 'no'}
              onValueChange={(value) => updateFormData({ familyDiabetes: value === 'yes' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="family-diabetes-yes" />
                <Label htmlFor="family-diabetes-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="family-diabetes-no" />
                <Label htmlFor="family-diabetes-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">High Blood Pressure in Family</span>
            <RadioGroup
              value={formData.familyHighBP === null ? '' : formData.familyHighBP ? 'yes' : 'no'}
              onValueChange={(value) => updateFormData({ familyHighBP: value === 'yes' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="family-bp-yes" />
                <Label htmlFor="family-bp-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="family-bp-no" />
                <Label htmlFor="family-bp-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="space-y-2">
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          placeholder="List any medications you're currently taking..."
          value={formData.currentMedications}
          onChange={(e) => updateFormData({ currentMedications: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Known Allergies</Label>
        <Textarea
          id="allergies"
          placeholder="List any allergies (food, medication, environmental)..."
          value={formData.allergies}
          onChange={(e) => updateFormData({ allergies: e.target.value })}
        />
      </div>
    </div>
  )
}
