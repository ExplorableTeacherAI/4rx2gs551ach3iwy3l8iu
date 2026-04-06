import { type ReactElement, useState, useRef, useEffect } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineClozeChoice,
    InlineFeedback,
    InlineFormula,
    InlineTrigger,
    Cartesian2D,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import { TriggeredHintOverlay } from "@/components/atoms/visual/TriggeredHintOverlay";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    choicePropsFromDefinition,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Reactive visualization for coefficient a with two draggable points on the curve
function CoefficientAViz() {
    const a = useVar("exploreA", 1) as number;
    const setVar = useSetVar();

    // Track if we're currently dragging to avoid key changes during drag
    const isDraggingRef = useRef(false);
    const [vizKey, setVizKey] = useState(0);
    const lastExternalA = useRef(a);

    // Detect external changes (triggers, scrubbles) vs drag changes
    useEffect(() => {
        // If not dragging and value changed significantly, force re-render
        if (!isDraggingRef.current && Math.abs(a - lastExternalA.current) > 0.05) {
            setVizKey(k => k + 1);
        }
        lastExternalA.current = a;
    }, [a]);

    // Color constants
    const COLOR_A = "#62D0AD"; // Teal for 'a' coefficient
    const COLOR_CURVE = "#6366f1"; // Soft indigo for f(x) curve

    // Points on the curve at x = ±2 (symmetrical)
    const pointX = 2;
    const curveY = a * pointX * pointX;

    return (
        <div className="relative">
            <Cartesian2D
                key={vizKey}
                height={350}
                viewBox={{ x: [-5, 5], y: [-5, 5] }}
                movablePoints={[
                    // Right point on curve (x = 2) - drag vertically to change 'a'
                    {
                        initial: [pointX, a * pointX * pointX],
                        color: COLOR_A,
                        position: [pointX, a * pointX * pointX],
                        constrain: (point) => {
                            // Constrain to vertical line at x = 2, limit y range
                            const newY = Math.max(-4.8, Math.min(4.8, point[1]));
                            return [pointX, newY];
                        },
                        onChange: (point) => {
                            isDraggingRef.current = true;
                            // y = a * x² at x = 2, so a = y / 4
                            const newA = point[1] / (pointX * pointX);
                            // Round to nearest 0.1 to match step
                            const roundedA = Math.round(newA * 10) / 10;
                            if (roundedA >= -3 && roundedA <= 3 && roundedA !== 0) {
                                setVar("exploreA", roundedA);
                                lastExternalA.current = roundedA;
                            }
                            // Reset dragging flag after a short delay
                            setTimeout(() => { isDraggingRef.current = false; }, 100);
                        },
                    },
                    // Left point on curve (x = -2) - mirrors the right point
                    {
                        initial: [-pointX, a * pointX * pointX],
                        color: COLOR_A,
                        position: [-pointX, a * pointX * pointX],
                        constrain: (point) => {
                            const newY = Math.max(-4.8, Math.min(4.8, point[1]));
                            return [-pointX, newY];
                        },
                        onChange: (point) => {
                            isDraggingRef.current = true;
                            // y = a * x² at x = -2, so a = y / 4
                            const newA = point[1] / (pointX * pointX);
                            const roundedA = Math.round(newA * 10) / 10;
                            if (roundedA >= -3 && roundedA <= 3 && roundedA !== 0) {
                                setVar("exploreA", roundedA);
                                lastExternalA.current = roundedA;
                            }
                            setTimeout(() => { isDraggingRef.current = false; }, 100);
                        },
                    },
                ]}
                plots={[
                    // Reference parabola y = x² (dashed grey)
                    {
                        type: "function",
                        fn: (x: number) => x * x,
                        color: "#94a3b8",
                        weight: 2,
                        domain: [-5, 5] as [number, number],
                    },
                    // Active parabola y = ax²
                    {
                        type: "function",
                        fn: (x: number) => a * x * x,
                        color: COLOR_CURVE,
                        weight: 3,
                        domain: [-5, 5] as [number, number],
                    },
                    // Vertex point at origin
                    {
                        type: "point",
                        x: 0,
                        y: 0,
                        color: COLOR_A,
                    },
                    // Vertical indicator lines showing 'a' effect
                    {
                        type: "segment",
                        point1: [pointX, 0],
                        point2: [pointX, curveY],
                        color: COLOR_A,
                        weight: 2,
                        style: "dashed",
                    },
                    {
                        type: "segment",
                        point1: [-pointX, 0],
                        point2: [-pointX, curveY],
                        color: COLOR_A,
                        weight: 2,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="coefficient-a-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the teal points up or down to change steepness",
                        position: { x: "70%", y: "35%" },
                    },
                ]}
            />
            {/* Triggered hint overlay for feedback-driven guidance */}
            <TriggeredHintOverlay hintKey="feedback-direction-positive" />
            <TriggeredHintOverlay hintKey="feedback-width-comparison" />
        </div>
    );
}

export const coefficientABlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-coeff-a-heading" maxWidth="xl">
        <Block id="coeff-a-heading" padding="md">
            <EditableH2 id="h2-coeff-a-heading" blockId="coeff-a-heading">
                The "a" Coefficient: Direction and Width
            </EditableH2>
        </Block>
    </StackLayout>,

    // Opening explanation
    <StackLayout key="layout-coeff-a-intro" maxWidth="xl">
        <Block id="coeff-a-intro" padding="sm">
            <EditableParagraph id="para-coeff-a-intro" blockId="coeff-a-intro">
                The coefficient{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is the most powerful number in the quadratic equation. It controls two things at once: whether the parabola opens upward or downward, and how wide or narrow it is.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Direction explanation with triggers
    <StackLayout key="layout-coeff-a-direction" maxWidth="xl">
        <Block id="coeff-a-direction" padding="sm">
            <EditableParagraph id="para-coeff-a-direction" blockId="coeff-a-direction">
                When{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is{" "}
                <InlineTrigger
                    id="trigger-positive-a"
                    varName="exploreA"
                    value={2}
                    color="#62D0AD"
                >
                    positive
                </InlineTrigger>, the parabola opens upward like a smile. When{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is{" "}
                <InlineTrigger
                    id="trigger-negative-a"
                    varName="exploreA"
                    value={-2}
                    color="#62D0AD"
                >
                    negative
                </InlineTrigger>, it flips upside down like a frown. The sign of{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                determines which way the curve faces.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive exploration
    <SplitLayout key="layout-coeff-a-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="coeff-a-explore-text" padding="sm">
                <EditableParagraph id="para-coeff-a-explore-text" blockId="coeff-a-explore-text">
                    The indigo curve shows{" "}
                    <InlineFormula
                        latex="\clr{fx}{y} = \clr{a}{a}x^2"
                        colorMap={{ fx: "#6366f1", a: "#62D0AD" }}
                    />{" "}
                    where{" "}
                    <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="exploreA"
                        {...numberPropsFromDefinition(getVariableInfo("exploreA"))}
                    />. The grey dashed curve shows the reference parabola{" "}
                    <InlineFormula latex="y = x^2" colorMap={{}} />{" "}
                    where a = 1.
                </EditableParagraph>
            </Block>
            <Block id="coeff-a-width-explanation" padding="sm">
                <EditableParagraph id="para-coeff-a-width-explanation" blockId="coeff-a-width-explanation">
                    The size of{" "}
                    <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                    controls the width. When |a| {">"} 1, the parabola is{" "}
                    <InlineTrigger
                        id="trigger-narrow-a"
                        varName="exploreA"
                        value={2.5}
                        color="#62D0AD"
                    >
                        narrower
                    </InlineTrigger>{" "}
                    than the reference. When |a| {"<"} 1, it's{" "}
                    <InlineTrigger
                        id="trigger-wide-a"
                        varName="exploreA"
                        value={0.5}
                        color="#62D0AD"
                    >
                        wider
                    </InlineTrigger>. Drag the teal points on the curve up or down to see how the parabola stretches and compresses.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="coeff-a-viz" padding="sm" hasVisualization>
            <CoefficientAViz />
        </Block>
    </SplitLayout>,

    // Assessment question 1 - Direction
    <StackLayout key="layout-coeff-a-question-direction" maxWidth="xl">
        <Block id="coeff-a-question-direction" padding="md">
            <EditableParagraph id="para-coeff-a-question-direction" blockId="coeff-a-question-direction">
                When{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is positive (like a = 2), the parabola opens{" "}
                <InlineFeedback
                    varName="answerDirectionPositive"
                    correctValue="upward"
                    position="terminal"
                    successMessage="— exactly! A positive 'a' means the parabola smiles upward"
                    failureMessage="— not quite. Let's explore this in the graph!"
                    hint="Think about which way a smile curves"
                    visualizationHint={{
                        blockId: "coeff-a-viz",
                        hintKey: "feedback-direction-positive",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "First, drag the teal point UP to make a = 2. Watch which way the curve opens!",
                                position: { x: "70%", y: "30%" },
                                completionVar: "exploreA",
                                completionValue: 2,
                                completionTolerance: 0.5,
                            },
                            {
                                gesture: "drag-vertical",
                                label: "Now drag it DOWN to make a = -2. See how the curve flips!",
                                position: { x: "70%", y: "70%" },
                                completionVar: "exploreA",
                                completionValue: -2,
                                completionTolerance: 0.5,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { exploreA: 1 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerDirectionPositive"
                        correctAnswer="upward"
                        options={["upward", "downward", "left", "right"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerDirectionPositive"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Assessment question 2 - Width
    <StackLayout key="layout-coeff-a-question-width" maxWidth="xl">
        <Block id="coeff-a-question-width" padding="md">
            <EditableParagraph id="para-coeff-a-question-width" blockId="coeff-a-question-width">
                Compared to{" "}
                <InlineFormula latex="y = x^2" colorMap={{}} />, the parabola{" "}
                <InlineFormula latex="y = 2x^2" colorMap={{}} />{" "}
                is{" "}
                <InlineFeedback
                    varName="answerWidthComparison"
                    correctValue="narrower"
                    position="terminal"
                    successMessage="— correct! Larger |a| means a narrower, steeper curve"
                    failureMessage="— let's check."
                    hint="When a is bigger, the y values grow faster"
                    visualizationHint={{
                        blockId: "coeff-a-viz",
                        hintKey: "feedback-width-comparison",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag to set a = 2 and compare with the grey reference curve",
                                position: { x: "50%", y: "35%" },
                                completionVar: "exploreA",
                                completionValue: 2,
                                completionTolerance: 0.5,
                            },
                        ],
                        label: "Compare in the graph",
                        resetVars: { exploreA: 1 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerWidthComparison"
                        correctAnswer="narrower"
                        options={["wider", "narrower", "same width"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerWidthComparison"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Key takeaway
    <StackLayout key="layout-coeff-a-summary" maxWidth="xl">
        <Block id="coeff-a-summary" padding="sm">
            <EditableParagraph id="para-coeff-a-summary" blockId="coeff-a-summary">
                Remember: the sign of{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                controls direction (positive = up, negative = down), and the magnitude of{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                controls width (larger = narrower, smaller = wider).
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
