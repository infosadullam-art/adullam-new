import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutStepsProps {
  currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, title: "Livraison", description: "Adresse de livraison" },
    { number: 2, title: "Paiement", description: "Mode de paiement" },
    { number: 3, title: "Confirmation", description: "Vérifier la commande" },
  ]

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-border hidden md:block">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all mb-2 bg-white",
                currentStep > step.number
                  ? "bg-brand border-brand text-white"
                  : currentStep === step.number
                    ? "border-brand text-brand"
                    : "border-border text-muted-foreground",
              )}
            >
              {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "font-semibold text-sm lg:text-base",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground hidden md:block">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
