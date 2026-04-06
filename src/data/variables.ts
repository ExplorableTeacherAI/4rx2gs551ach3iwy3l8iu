/**
 * Variables Configuration
 * =======================
 *
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 *
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 *
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /** Correct answer for cloze input validation */
    correctAnswer?: string;
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 QUADRATIC FUNCTIONS LESSON VARIABLES
 * =====================================================
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ─────────────────────────────────────────
    // COEFFICIENT VARIABLES
    // ─────────────────────────────────────────
    coefficientA: {
        defaultValue: 1,
        type: 'number',
        label: 'Coefficient a',
        description: 'Controls parabola direction and width',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD', // Soft teal
    },

    coefficientB: {
        defaultValue: 0,
        type: 'number',
        label: 'Coefficient b',
        description: 'Controls horizontal shift and vertex position',
        min: -4,
        max: 4,
        step: 0.1,
        color: '#8E90F5', // Soft indigo
    },

    coefficientC: {
        defaultValue: 0,
        type: 'number',
        label: 'Coefficient c',
        description: 'Controls vertical shift (y-intercept)',
        min: -5,
        max: 5,
        step: 0.1,
        color: '#F7B23B', // Warm amber
    },

    // ─────────────────────────────────────────
    // SECTION-SPECIFIC EXPLORATION VARIABLES
    // ─────────────────────────────────────────
    exploreA: {
        defaultValue: 1,
        type: 'number',
        label: 'Explore a',
        description: 'For the a coefficient section',
        min: -3,
        max: 3,
        step: 0.1,
        color: '#62D0AD',
    },

    exploreC: {
        defaultValue: 0,
        type: 'number',
        label: 'Explore c',
        description: 'For the c coefficient section',
        min: -5,
        max: 5,
        step: 0.1,
        color: '#F7B23B',
    },

    exploreB: {
        defaultValue: 0,
        type: 'number',
        label: 'Explore b',
        description: 'For the b coefficient section',
        min: -4,
        max: 4,
        step: 0.1,
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // ASSESSMENT VARIABLES
    // ─────────────────────────────────────────
    answerDirectionPositive: {
        defaultValue: '',
        type: 'select',
        label: 'Direction Answer (Positive a)',
        description: 'Student answer for parabola direction when a > 0',
        placeholder: '???',
        correctAnswer: 'upward',
        options: ['upward', 'downward', 'left', 'right'],
        color: '#62D0AD',
    },

    answerDirectionNegative: {
        defaultValue: '',
        type: 'select',
        label: 'Direction Answer (Negative a)',
        description: 'Student answer for parabola direction when a < 0',
        placeholder: '???',
        correctAnswer: 'downward',
        options: ['upward', 'downward', 'left', 'right'],
        color: '#62D0AD',
    },

    answerYIntercept: {
        defaultValue: '',
        type: 'text',
        label: 'Y-Intercept Answer',
        description: 'Student answer for y-intercept question',
        placeholder: '?',
        correctAnswer: '3',
        color: '#F7B23B',
    },

    answerWidthComparison: {
        defaultValue: '',
        type: 'select',
        label: 'Width Comparison Answer',
        description: 'Student answer comparing parabola widths',
        placeholder: '???',
        correctAnswer: 'narrower',
        options: ['wider', 'narrower', 'same width'],
        color: '#62D0AD',
    },

    answerVertexX: {
        defaultValue: '',
        type: 'text',
        label: 'Vertex X Answer',
        description: 'Student answer for vertex x-coordinate',
        placeholder: '?',
        correctAnswer: '-1',
        color: '#8E90F5',
    },

    answerSketchDirection: {
        defaultValue: '',
        type: 'select',
        label: 'Sketch Direction Answer',
        description: 'Student answer for sketch question direction',
        placeholder: '???',
        correctAnswer: 'downward',
        options: ['upward', 'downward'],
        color: '#AC8BF9',
    },

    answerSketchYIntercept: {
        defaultValue: '',
        type: 'text',
        label: 'Sketch Y-Intercept Answer',
        description: 'Student answer for sketch question y-intercept',
        placeholder: '?',
        correctAnswer: '2',
        color: '#AC8BF9',
    },

    // ─────────────────────────────────────────
    // HIGHLIGHT VARIABLES
    // ─────────────────────────────────────────
    quadraticHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Quadratic Highlight',
        description: 'For linking prose to visualization elements',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.15)',
    },

    introFormulaHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Introduction Formula Highlight',
        description: 'For linking f(x) in formula to the curve in visualization',
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.15)',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
