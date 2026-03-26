"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { FORM_SECTIONS, initialHealthFormData, type HealthFormData } from "@/lib/health-data"
import { ChevronLeft, ChevronRight, Save, CheckCircle2 } from "lucide-react"
import { BasicInfoSection } from "@/components/health-form/basic-info-section"
import { VitalSignsSection } from "@/components/health-form/vital-signs-section"
import { LifestyleSection } from "@/components/health-form/lifestyle-section"
import { MedicalHistorySection } from "@/components/health-form/medical-history-section"
import { SymptomsSection } from "@/components/health-form/symptoms-section"

export default function HealthFormPage() {
  const [currentSection, setCurrentSection] = useState(1)
  const [formData, setFormData] = useState<HealthFormData>(initialHealthFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, completeHealthForm } = useAuth()
  const router = useRouter()

  const progress = (currentSection / FORM_SECTIONS.length) * 100

  const updateFormData = (updates: Partial<HealthFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentSection < FORM_SECTIONS.length) {
      setCurrentSection(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1)
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('healthpulse_form_draft', JSON.stringify(formData))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const userId = localStorage.getItem("user_id")  // ✅ get user_id

    const payload = {
      user_id: Number(userId),                       // ✅ include user_id
      age: formData.age,
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      location: formData.location,
      work_type: formData.workType,
      heart_rate: formData.restingHeartRate,
      systolic: formData.bloodPressureSystolic,
      diastolic: formData.bloodPressureDiastolic,
      spo2: formData.spO2,
      temperature: formData.bodyTemperature,
      exercise: formData.doesExercise,
      exercise_type: formData.exerciseType,
      duration: formData.exerciseDuration,
      diet: formData.dietType,
      water: formData.waterIntake,
      sleep: formData.sleepHours,
      smoking: formData.smoking,
    }

    try {
      const res = await fetch("http://localhost:8001/save-health-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      console.log("Status:", res.status)       // ← check this in browser console
      const result = await res.json()
      console.log("Response:", result)         // ← check this in browser console

      if (!res.ok) {
        console.error("Failed to save:", result)
        setIsSubmitting(false)
        return                                 // ✅ stop here, don't redirect
      }

      // ✅ Only redirect if save was successful
      completeHealthForm()
      router.push("/dashboard")

    } catch (err) {
      console.error("Network error:", err)
      setIsSubmitting(false)
    }
  }

  const currentSectionData = FORM_SECTIONS[currentSection - 1]

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Health Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Complete this form to get personalized health insights
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentSection} of {FORM_SECTIONS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Section indicators */}
          <div className="flex justify-between mt-4">
            {FORM_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all
                  ${section.id === currentSection 
                    ? 'bg-primary text-primary-foreground' 
                    : section.id < currentSection 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}
              >
                {section.id < currentSection ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  section.id
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">{currentSectionData.title}</CardTitle>
            <CardDescription>{currentSectionData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentSection === 1 && (
              <BasicInfoSection formData={formData} updateFormData={updateFormData} />
            )}
            {currentSection === 2 && (
              <VitalSignsSection formData={formData} updateFormData={updateFormData} />
            )}
            {currentSection === 3 && (
              <LifestyleSection formData={formData} updateFormData={updateFormData} />
            )}
            {currentSection === 4 && (
              <MedicalHistorySection formData={formData} updateFormData={updateFormData} />
            )}
            {currentSection === 5 && (
              <SymptomsSection formData={formData} updateFormData={updateFormData} />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={handleSaveDraft}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          </div>
          
          {currentSection < FORM_SECTIONS.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? "Submitting..." : "Submit & View Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
