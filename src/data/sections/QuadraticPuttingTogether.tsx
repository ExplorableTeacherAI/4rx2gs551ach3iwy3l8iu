import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineClozeInput,
    InlineClozeChoice,
    InlineFeedback,
    InlineFormula,
    Cartesian2D,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Full interactive parabola visualization
function FullParabolaViz() {
    const a = useVar("coefficientA", 1) as number;
    const b = useVar("coefficientB", 0) as number;
    const c = useVar("coefficientC", 0) as number;
    const setVar = useSetVar();

    // Calculate vertex
    const vertexX = a !== 0 ? -b / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    return (
        <div className="relative">
            <Cartesian2D
                height={380}
                viewBox={{ x: [-6, 6], y: [-6, 6] }}
                movablePoints={[
                    {
                        initial: [vertexX, vertexY],
                        color: "#62D0AD",
                        position: [vertexX, vertexY],
                        onChange: (point) => {
                            // Update c based on vertical movement, keeping vertex x fixed
                            const newVertexY = point[1];
                            // y_vertex = a*x_v² + b*x_v + c
                            // c = y_vertex - a*x_v² - b*x_v
                            const newC = newVertexY - a * vertexX * vertexX - b * vertexX;
                            if (newC >= -5 && newC <= 5) {
                                setVar("coefficientC", Math.round(newC * 2) / 2);
                            }
                        },
                    },
                ]}
                plots={[
                    // Main parabola
                    {
                        type: "function",
                        fn: (x: number) => a * x * x + b * x + c,
                        color: "#62D0AD",
                        weight: 3,
                        domain: [-6, 6] as [number, number],
                    },
                    // Y-intercept point
                    {
                        type: "point",
                        x: 0,
                        y: c,
                        color: "#F7B23B",
                    },
                    // Axis of symmetry
                    {
                        type: "segment",
                        point1: [vertexX, -6],
                        point2: [vertexX, 6],
                        color: "#8E90F5",
                        weight: 1,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="full-parabola-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the vertex to move the parabola",
                        position: { x: "50%", y: "50%" },
                    },
                ]}
            />
        </div>
    );
}

// Reactive computed values display
function ComputedValuesDisplay() {
    const a = useVar("coefficientA", 1) as number;
    const b = useVar("coefficientB", 0) as number;
    const c = useVar("coefficientC", 0) as number;

    const vertexX = a !== 0 ? -b / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const direction = a > 0 ? "upward ↑" : a < 0 ? "downward ↓" : "flat —";

    return (
        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-600">Direction:</span>
                <span className="font-medium" style={{ color: a >= 0 ? "#22c55e" : "#ef4444" }}>
                    {direction}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-600">Y-intercept:</span>
                <span className="font-medium" style={{ color: "#F7B23B" }}>
                    (0, {c})
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-600">Vertex:</span>
                <span className="font-medium" style={{ color: "#62D0AD" }}>
                    ({vertexX.toFixed(1)}, {vertexY.toFixed(1)})
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-600">Axis of symmetry:</span>
                <span className="font-medium" style={{ color: "#8E90F5" }}>
                    x = {vertexX.toFixed(1)}
                </span>
            </div>
        </div>
    );
}

export const puttingTogetherBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-together-heading" maxWidth="xl">
        <Block id="together-heading" padding="md">
            <EditableH2 id="h2-together-heading" blockId="together-heading">
                Putting It All Together
            </EditableH2>
        </Block>
    </StackLayout>,

    // Summary paragraph
    <StackLayout key="layout-together-summary" maxWidth="xl">
        <Block id="together-summary" padding="sm">
            <EditableParagraph id="para-together-summary" blockId="together-summary">
                Now you know what each coefficient does:{" "}
                <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor>{" "}
                controls direction and width,{" "}
                <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor>{" "}
                shifts the vertex horizontally, and{" "}
                <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor>{" "}
                shifts the parabola vertically. Let's practise using all three together.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive formula
    <StackLayout key="layout-together-formula" maxWidth="xl">
        <Block id="together-formula" padding="md">
            <FormulaBlock
                latex="f(x) = \scrub{coefficientA}x^2 + \scrub{coefficientB}x + \scrub{coefficientC}"
                variables={scrubVarsFromDefinitions(["coefficientA", "coefficientB", "coefficientC"])}
            />
        </Block>
    </StackLayout>,

    // Full interactive exploration
    <SplitLayout key="layout-together-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="together-controls" padding="sm">
                <EditableParagraph id="para-together-controls" blockId="together-controls">
                    Adjust all three coefficients:{" "}
                    <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientA"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientA"))}
                    />,{" "}
                    <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientB"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientB"))}
                    />,{" "}
                    <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientC"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientC"))}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="together-computed" padding="sm">
                <ComputedValuesDisplay />
            </Block>
            <Block id="together-instruction" padding="sm">
                <EditableParagraph id="para-together-instruction" blockId="together-instruction">
                    Drag the vertex in the graph or scrub the values above. Watch how the computed properties update in real time. The amber dot shows the y-intercept, and the dashed indigo line shows the axis of symmetry.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="together-viz" padding="sm" hasVisualization>
            <FullParabolaViz />
        </Block>
    </SplitLayout>,

    // Sketch challenge heading
    <StackLayout key="layout-sketch-heading" maxWidth="xl">
        <Block id="sketch-heading" padding="md">
            <EditableH2 id="h2-sketch-heading" blockId="sketch-heading">
                Sketch Challenge
            </EditableH2>
        </Block>
    </StackLayout>,

    // Sketch challenge intro
    <StackLayout key="layout-sketch-intro" maxWidth="xl">
        <Block id="sketch-intro" padding="sm">
            <EditableParagraph id="para-sketch-intro" blockId="sketch-intro">
                Given an equation, can you predict what the parabola looks like? Let's find out. Consider the function{" "}
                <InlineFormula
                    latex="f(x) = -x^2 + 4x + 2"
                    colorMap={{}}
                />. Without graphing it, answer these questions:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question 1: Direction
    <StackLayout key="layout-sketch-question-direction" maxWidth="xl">
        <Block id="sketch-question-direction" padding="md">
            <EditableParagraph id="para-sketch-question-direction" blockId="sketch-question-direction">
                Since a = −1 (which is negative), the parabola opens{" "}
                <InlineFeedback
                    varName="answerSketchDirection"
                    correctValue="downward"
                    position="terminal"
                    successMessage="— exactly! Negative a means the parabola opens downward like a frown"
                    failureMessage="— remember what the sign of a tells us."
                    hint="A negative 'a' flips the parabola upside down"
                >
                    <InlineClozeChoice
                        varName="answerSketchDirection"
                        correctAnswer="downward"
                        options={["upward", "downward"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerSketchDirection"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Question 2: Y-intercept
    <StackLayout key="layout-sketch-question-yintercept" maxWidth="xl">
        <Block id="sketch-question-yintercept" padding="md">
            <EditableParagraph id="para-sketch-question-yintercept" blockId="sketch-question-yintercept">
                The parabola crosses the y-axis at y ={" "}
                <InlineFeedback
                    varName="answerSketchYIntercept"
                    correctValue="2"
                    position="terminal"
                    successMessage="— correct! The y-intercept is always equal to c"
                    failureMessage="— look at the value of c in the equation."
                    hint="When x = 0, the entire equation simplifies to just c"
                >
                    <InlineClozeInput
                        varName="answerSketchYIntercept"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo("answerSketchYIntercept"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Conclusion
    <StackLayout key="layout-conclusion" maxWidth="xl">
        <Block id="conclusion" padding="md">
            <EditableParagraph id="para-conclusion" blockId="conclusion">
                Well done! You can now look at any quadratic equation{" "}
                <InlineFormula
                    latex="f(x) = ax^2 + bx + c"
                    colorMap={{}}
                />{" "}
                and immediately know: which way it opens (sign of a), how wide it is (magnitude of a), where it crosses the y-axis (c), and where the vertex is (x = −b/2a). With practice, you'll be sketching parabolas in no time.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
