import { type ReactElement } from "react";
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
    Cartesian2D,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    choicePropsFromDefinition,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Reactive visualization for coefficient a
function CoefficientAViz() {
    const a = useVar("exploreA", 1) as number;
    const setVar = useSetVar();

    // Calculate vertex position (at origin for simplicity)
    const vertexY = 0;

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-5, 5], y: [-5, 5] }}
                movablePoints={[
                    {
                        initial: [0, vertexY],
                        color: "#62D0AD",
                        position: [0, vertexY],
                        constrain: "vertical",
                        onChange: (point) => {
                            // Dragging vertex adjusts 'a' based on the point at x=1
                            // At x=1, y = a, so we can infer a from how the curve changes
                            // For intuitive feel, we map vertical drag to a change
                            const newY = point[1];
                            // This creates a nice feel where dragging up makes the parabola narrower
                            const newA = Math.max(-3, Math.min(3, newY === 0 ? 1 : (newY > 0 ? newY : newY)));
                            if (Math.abs(newA) >= 0.5) {
                                setVar("exploreA", Math.round(newA * 2) / 2);
                            }
                        },
                    },
                ]}
                plots={[
                    // Reference parabola y = x² (dashed)
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
                        color: "#62D0AD",
                        weight: 3,
                        domain: [-5, 5] as [number, number],
                    },
                    // Point at x=1 to show the value of 'a'
                    {
                        type: "point",
                        x: 1,
                        y: a,
                        color: "#62D0AD",
                    },
                    // Label indicator segment
                    {
                        type: "segment",
                        point1: [1, 0],
                        point2: [1, a],
                        color: "#62D0AD",
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
                        label: "Drag to change the steepness",
                        position: { x: "50%", y: "50%" },
                    },
                ]}
            />
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

    // Direction explanation
    <StackLayout key="layout-coeff-a-direction" maxWidth="xl">
        <Block id="coeff-a-direction" padding="sm">
            <EditableParagraph id="para-coeff-a-direction" blockId="coeff-a-direction">
                When{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is positive, the parabola opens upward like a smile. When{" "}
                <InlineSpotColor varName="exploreA" color="#62D0AD">a</InlineSpotColor>{" "}
                is negative, it flips upside down like a frown. The sign of{" "}
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
                    The teal curve shows{" "}
                    <InlineFormula
                        latex="y = \clr{a}{a}x^2"
                        colorMap={{ a: "#62D0AD" }}
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
                    controls the width. When |a| {">"} 1, the parabola is narrower than the reference. When |a| {"<"} 1, it's wider. Drag the teal point at the vertex or scrub the value to see this in action.
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
                    failureMessage="— not quite."
                    hint="Think about which way a smile curves"
                    visualizationHint={{
                        blockId: "coeff-a-viz",
                        hintKey: "feedback-direction-positive",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag the vertex point upward and watch the curve direction",
                                position: { x: "50%", y: "40%" },
                                completionVar: "exploreA",
                                completionValue: 2,
                                completionTolerance: 1,
                            },
                        ],
                        label: "See it in the graph",
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
