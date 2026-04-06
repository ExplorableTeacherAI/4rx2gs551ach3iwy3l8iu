import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    Cartesian2D,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Reactive visualization for coefficient c
function CoefficientCViz() {
    const c = useVar("exploreC", 0) as number;
    const setVar = useSetVar();

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-5, 5], y: [-6, 6] }}
                movablePoints={[
                    {
                        initial: [0, c],
                        color: "#F7B23B",
                        position: [0, c],
                        constrain: "vertical",
                        onChange: (point) => {
                            const newC = Math.round(point[1]);
                            if (newC >= -5 && newC <= 5) {
                                setVar("exploreC", newC);
                            }
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
                    // Active parabola y = x² + c
                    {
                        type: "function",
                        fn: (x: number) => x * x + c,
                        color: "#F7B23B",
                        weight: 3,
                        domain: [-5, 5] as [number, number],
                    },
                    // Y-axis intercept highlight
                    {
                        type: "segment",
                        point1: [-0.3, c],
                        point2: [0.3, c],
                        color: "#F7B23B",
                        weight: 4,
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="coefficient-c-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the point up or down",
                        position: { x: "50%", y: "50%" },
                    },
                ]}
            />
        </div>
    );
}

export const coefficientCBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-coeff-c-heading" maxWidth="xl">
        <Block id="coeff-c-heading" padding="md">
            <EditableH2 id="h2-coeff-c-heading" blockId="coeff-c-heading">
                The "c" Coefficient: Vertical Shift
            </EditableH2>
        </Block>
    </StackLayout>,

    // Opening explanation
    <StackLayout key="layout-coeff-c-intro" maxWidth="xl">
        <Block id="coeff-c-intro" padding="sm">
            <EditableParagraph id="para-coeff-c-intro" blockId="coeff-c-intro">
                The coefficient{" "}
                <InlineSpotColor varName="exploreC" color="#F7B23B">c</InlineSpotColor>{" "}
                is the simplest one to understand. It shifts the entire parabola up or down without changing its shape at all.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Y-intercept explanation
    <StackLayout key="layout-coeff-c-yintercept" maxWidth="xl">
        <Block id="coeff-c-yintercept" padding="sm">
            <EditableParagraph id="para-coeff-c-yintercept" blockId="coeff-c-yintercept">
                Here's a simple fact:{" "}
                <InlineSpotColor varName="exploreC" color="#F7B23B">c</InlineSpotColor>{" "}
                is exactly where the parabola crosses the y-axis. When x = 0, the equation{" "}
                <InlineFormula
                    latex="y = ax^2 + bx + c"
                    colorMap={{}}
                />{" "}
                becomes{" "}
                <InlineFormula
                    latex="y = \clr{c}{c}"
                    colorMap={{ c: "#F7B23B" }}
                />. This point (0, c) is called the y-intercept.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive exploration
    <SplitLayout key="layout-coeff-c-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="coeff-c-explore-text" padding="sm">
                <EditableParagraph id="para-coeff-c-explore-text" blockId="coeff-c-explore-text">
                    The amber curve shows{" "}
                    <InlineFormula
                        latex="y = x^2 + \clr{c}{c}"
                        colorMap={{ c: "#F7B23B" }}
                    />{" "}
                    where{" "}
                    <InlineSpotColor varName="exploreC" color="#F7B23B">c</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="exploreC"
                        {...numberPropsFromDefinition(getVariableInfo("exploreC"))}
                    />. The grey dashed curve shows{" "}
                    <InlineFormula latex="y = x^2" colorMap={{}} />{" "}
                    for comparison.
                </EditableParagraph>
            </Block>
            <Block id="coeff-c-explore-instruction" padding="sm">
                <EditableParagraph id="para-coeff-c-explore-instruction" blockId="coeff-c-explore-instruction">
                    Drag the amber point on the y-axis up and down. Notice how the entire curve moves with it, keeping the exact same shape. The y-intercept (the thick amber mark) moves to match the value of c.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="coeff-c-viz" padding="sm" hasVisualization>
            <CoefficientCViz />
        </Block>
    </SplitLayout>,

    // Assessment question
    <StackLayout key="layout-coeff-c-question" maxWidth="xl">
        <Block id="coeff-c-question" padding="md">
            <EditableParagraph id="para-coeff-c-question" blockId="coeff-c-question">
                For the function{" "}
                <InlineFormula
                    latex="f(x) = 2x^2 - 4x + 3"
                    colorMap={{}}
                />, what is the y-intercept? The parabola crosses the y-axis at y ={" "}
                <InlineFeedback
                    varName="answerYIntercept"
                    correctValue="3"
                    position="terminal"
                    successMessage="— exactly! The y-intercept equals c, which is 3"
                    failureMessage="— not quite."
                    hint="Remember, when x = 0, the entire equation simplifies to just c"
                    visualizationHint={{
                        blockId: "coeff-c-viz",
                        hintKey: "feedback-y-intercept",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag to set c = 3 and see where the curve crosses the y-axis",
                                position: { x: "50%", y: "35%" },
                                completionVar: "exploreC",
                                completionValue: 3,
                                completionTolerance: 0.5,
                            },
                        ],
                        label: "Find it in the graph",
                        resetVars: { exploreC: 0 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerYIntercept"
                        correctAnswer="3"
                        {...clozePropsFromDefinition(getVariableInfo("answerYIntercept"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Key takeaway
    <StackLayout key="layout-coeff-c-summary" maxWidth="xl">
        <Block id="coeff-c-summary" padding="sm">
            <EditableParagraph id="para-coeff-c-summary" blockId="coeff-c-summary">
                Remember:{" "}
                <InlineSpotColor varName="exploreC" color="#F7B23B">c</InlineSpotColor>{" "}
                shifts the parabola vertically. Positive c moves it up, negative c moves it down. And c is always the y-intercept.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
