import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

// Import all sections
import { introductionBlocks } from "./sections/QuadraticIntroduction";
import { coefficientABlocks } from "./sections/QuadraticCoefficientA";
import { coefficientCBlocks } from "./sections/QuadraticCoefficientC";
import { coefficientBBlocks } from "./sections/QuadraticCoefficientB";
import { puttingTogetherBlocks } from "./sections/QuadraticPuttingTogether";

/**
 * ------------------------------------------------------------------
 * QUADRATIC FUNCTIONS LESSON
 * ------------------------------------------------------------------
 * An interactive explorable explanation of quadratic functions,
 * teaching students how the coefficients a, b, and c affect
 * the shape and position of a parabola.
 *
 * Sections:
 * 1. Introduction - Overview of the standard form
 * 2. The "a" Coefficient - Direction and width
 * 3. The "c" Coefficient - Vertical shift (y-intercept)
 * 4. The "b" Coefficient - Horizontal movement (vertex position)
 * 5. Putting It Together - Practice and application
 */

export const blocks: ReactElement[] = [
    ...introductionBlocks,
    ...coefficientABlocks,
    ...coefficientCBlocks,
    ...coefficientBBlocks,
    ...puttingTogetherBlocks,
];
