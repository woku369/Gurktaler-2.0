import { useEffect, useState } from "react";
import { Calculator, Droplet, Euro } from "lucide-react";
import {
  recipeIngredients as recipeIngredientsService,
  ingredients as ingredientsService,
} from "@/renderer/services/storage";
import type { RecipeIngredient, Ingredient } from "@/shared/types";

interface RecipeCalculatorProps {
  recipeId: string;
  yieldAmount?: number;
  yieldUnit?: string;
}

interface CalculationResult {
  totalVolume: number; // in ml
  totalAlcohol: number; // pure alcohol in ml
  averageAlcoholPercentage: number; // %vol
  totalCost: number; // in Euro
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    alcoholPercentage?: number;
    cost?: number;
  }>;
}

export default function RecipeCalculator({
  recipeId,
  yieldAmount,
  yieldUnit,
}: RecipeCalculatorProps) {
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );

  useEffect(() => {
    calculateRecipe();
  }, [recipeId]);

  const convertToMl = (amount: number, unit: string): number => {
    const conversions: Record<string, number> = {
      ml: 1,
      l: 1000,
      g: 1, // Näherung: 1g ≈ 1ml für Flüssigkeiten
      kg: 1000,
      stk: 0, // Stück können nicht umgerechnet werden
      TL: 5,
      EL: 15,
    };
    return amount * (conversions[unit] || 0);
  };

  const calculateRecipe = async () => {
    const recipeIngs = (await recipeIngredientsService.getAll()).filter(
      (ri: RecipeIngredient) => ri.recipe_id === recipeId
    );
    const allIngredients = await ingredientsService.getAll();

    let totalVolume = 0;
    let totalAlcohol = 0;
    let totalCost = 0;
    const ingredientDetails: CalculationResult["ingredients"] = [];

    recipeIngs.forEach((ri: RecipeIngredient) => {
      const ingredient = allIngredients.find(
        (i: Ingredient) => i.id === ri.ingredient_id
      );
      if (!ingredient) return;

      const volumeMl = convertToMl(ri.amount, ri.unit);

      // Alkohol berechnen
      if (ingredient.alcohol_percentage && volumeMl > 0) {
        const alcoholMl = (volumeMl * ingredient.alcohol_percentage) / 100;
        totalAlcohol += alcoholMl;
      }

      // Kosten berechnen
      if (ingredient.price_per_unit) {
        let costForAmount = 0;
        if (ingredient.unit === "liter" && volumeMl > 0) {
          costForAmount = (volumeMl / 1000) * ingredient.price_per_unit;
        } else if (ingredient.unit === "kilogram") {
          // Für kg/g Zutaten
          const kg =
            ri.unit === "kg"
              ? ri.amount
              : ri.unit === "g"
              ? ri.amount / 1000
              : 0;
          costForAmount = kg * ingredient.price_per_unit;
        }
        totalCost += costForAmount;
      }

      totalVolume += volumeMl;

      ingredientDetails.push({
        name: ingredient.name,
        amount: ri.amount,
        unit: ri.unit,
        alcoholPercentage: ingredient.alcohol_percentage,
        cost: ingredient.price_per_unit,
      });
    });

    const averageAlcoholPercentage =
      totalVolume > 0 ? (totalAlcohol / totalVolume) * 100 : 0;

    setCalculation({
      totalVolume,
      totalAlcohol,
      averageAlcoholPercentage,
      totalCost,
      ingredients: ingredientDetails,
    });
  };

  if (!calculation) return null;

  return (
    <div className="bg-gurktaler-50 border border-gurktaler-200 rounded-vintage p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-gurktaler-700" />
        <h3 className="font-semibold text-gurktaler-900">Kalkulation</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Gesamtvolumen */}
        <div className="bg-white rounded-lg p-3 border border-gurktaler-100">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Droplet className="w-4 h-4" />
            <span>Gesamtmenge</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {calculation.totalVolume >= 1000
              ? `${(calculation.totalVolume / 1000).toFixed(2)} L`
              : `${calculation.totalVolume.toFixed(0)} ml`}
          </p>
          {yieldAmount && yieldUnit && (
            <p className="text-xs text-slate-500 mt-1">
              Ausbeute: {yieldAmount} {yieldUnit}
            </p>
          )}
        </div>

        {/* Alkoholgehalt */}
        <div className="bg-white rounded-lg p-3 border border-distillery-100">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Droplet className="w-4 h-4" />
            <span>Ø Alkoholgehalt</span>
          </div>
          <p className="text-lg font-semibold text-distillery-700">
            {calculation.averageAlcoholPercentage.toFixed(1)}% vol.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {calculation.totalAlcohol.toFixed(0)} ml reiner Alkohol
          </p>
        </div>

        {/* Kosten */}
        <div className="bg-white rounded-lg p-3 border border-bronze-100">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Euro className="w-4 h-4" />
            <span>Materialkosten</span>
          </div>
          <p className="text-lg font-semibold text-bronze-700">
            {calculation.totalCost > 0
              ? `€ ${calculation.totalCost.toFixed(2)}`
              : "—"}
          </p>
          {yieldAmount && calculation.totalCost > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              €{" "}
              {(
                calculation.totalCost /
                (yieldUnit === "l" ? yieldAmount : yieldAmount / 1000)
              ).toFixed(2)}{" "}
              / L
            </p>
          )}
        </div>
      </div>

      {calculation.totalCost === 0 && (
        <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded">
          💡 Tipp: Hinterlege Preise bei den Zutaten für automatische
          Kostenberechnung
        </p>
      )}
    </div>
  );
}
