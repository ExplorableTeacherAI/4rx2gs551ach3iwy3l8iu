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

// Side-by-side comparison visualization with reference curve
function FullParabolaViz() {
    const a = useVar("coefficientA", 1) as number;
    const b = useVar("coefficientB", 0) as number;
    const c = useVar("coefficientC", -5) as number;
    const setVar = useSetVar();

    // Color constants
    const COLOR_A = "#62D0AD"; // Teal for 'a' - controls steepness
    const COLOR_B = "#8E90F5"; // Indigo for 'b' - controls horizontal shift
    const COLOR_C = "#F7B23B"; // Amber for 'c' - controls vertical shift
    const COLOR_REFERENCE = "#cbd5e1"; // Faded slate for reference curve

    // Calculate vertex position
    const vertexX = a !== 0 ? -b / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Point positions for the three control handles
    // A-handle: on the curve at x=2 to control steepness
    const aHandleX = 2;
    const aHandleY = a * aHandleX * aHandleX + b * aHandleX + c;

    // B-handle: at the vertex to control horizontal position
    const bHandleX = vertexX;
    const bHandleY = vertexY;

    // C-handle: on the y-axis to control vertical shift
    const cHandleX = 0;
    const cHandleY = c;

    return (
        <div className="relative">
            <Cartesian2D
                height={400}
                viewBox={{ x: [-6, 6], y: [-8, 6] }}
                movablePoints={[
                    // A-handle: drag vertically to change steepness
                    {
                        initial: [aHandleX, aHandleY],
                        color: COLOR_A,
                        position: [aHandleX, aHandleY],
                        constrain: (point) => {
                            // Keep x fixed, only allow vertical movement
                            return [aHandleX, point[1]];
                        },
                        onChange: (point) => {
                            // Calculate new 'a' from the point position
                            // y = ax² + bx + c → a = (y - bx - c) / x²
                            const newY = point[1];
                            const newA = (newY - b * aHandleX - c) / (aHandleX * aHandleX);
                            if (newA >= -3 && newA <= 3 && newA !== 0) {
                                setVar("coefficientA", Math.round(newA * 10) / 10);
                            }
                        },
                    },
                    // B-handle: drag horizontally to shift vertex
                    {
                        initial: [bHandleX, bHandleY],
                        color: COLOR_B,
                        position: [bHandleX, bHandleY],
                        constrain: (point) => {
                            // Keep on the parabola path as it shifts horizontally
                            const newVertexX = Math.max(-4, Math.min(4, point[0]));
                            // b = -2a * vertex_x
                            const newB = -2 * a * newVertexX;
                            const newVertexY = a * newVertexX * newVertexX + newB * newVertexX + c;
                            return [newVertexX, newVertexY];
                        },
                        onChange: (point) => {
                            const newVertexX = point[0];
                            // b = -2a * vertex_x
                            const newB = -2 * a * newVertexX;
                            if (newB >= -4 && newB <= 4) {
                                setVar("coefficientB", Math.round(newB * 10) / 10);
                            }
                        },
                    },
                    // C-handle: drag vertically on y-axis
                    {
                        initial: [cHandleX, cHandleY],
                        color: COLOR_C,
                        position: [cHandleX, cHandleY],
                        constrain: "vertical",
                        onChange: (point) => {
                            const newC = Math.max(-6, Math.min(5, point[1]));
                            setVar("coefficientC", Math.round(newC * 10) / 10);
                        },
                    },
                ]}
                plots={[
                    // Reference curve: y = x² (faded)
                    {
                        type: "function",
                        fn: (x: number) => x * x,
                        color: COLOR_REFERENCE,
                        weight: 2,
                        style: "dashed",
                        domain: [-6, 6] as [number, number],
                    },
                    // Main parabola: f(x) = ax² + bx + c
                    {
                        type: "function",
                        fn: (x: number) => a * x * x + b * x + c,
                        color: "#6366f1",
                        weight: 3,
                        domain: [-6, 6] as [number, number],
                    },
                    // Axis of symmetry (dashed indigo line)
                    {
                        type: "segment",
                        point1: [vertexX, -8],
                        point2: [vertexX, 6],
                        color: COLOR_B,
                        weight: 1,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="comparison-parabola-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal point to change steepness, indigo to shift sideways, amber to move up/down",
                        position: { x: "50%", y: "95%" },
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

    // More Practice heading
    <StackLayout key="layout-practice-heading" maxWidth="xl">
        <Block id="practice-heading" padding="md">
            <EditableH2 id="h2-practice-heading" blockId="practice-heading">
                More Practice
            </EditableH2>
        </Block>
    </StackLayout>,

    // Practice intro
    <StackLayout key="layout-practice-intro" maxWidth="xl">
        <Block id="practice-intro" padding="sm">
            <EditableParagraph id="para-practice-intro" blockId="practice-intro">
                Ready to test your skills? Here are more equations to analyse. For each one, identify the key features before looking at the graph.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Example 2: f(x) = 3x² - 6x + 1
    <StackLayout key="layout-example2-equation" maxWidth="xl">
        <Block id="example2-equation" padding="sm">
            <EditableParagraph id="para-example2-equation" blockId="example2-equation">
                <strong>Example 2:</strong> Consider{" "}
                <InlineFormula
                    latex="f(x) = 3x^2 - 6x + 1"
                    colorMap={{}}
                />. Here a = 3, b = −6, and c = 1.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example2-direction" maxWidth="xl">
        <Block id="example2-direction" padding="sm">
            <EditableParagraph id="para-example2-direction" blockId="example2-direction">
                Since a = 3 is positive, the parabola opens{" "}
                <InlineFeedback
                    varName="answerExample2Direction"
                    correctValue="upward"
                    position="terminal"
                    successMessage="— yes! Positive a always means upward"
                    failureMessage="— think about the sign of a"
                    hint="Positive a = smile, negative a = frown"
                >
                    <InlineClozeChoice
                        varName="answerExample2Direction"
                        correctAnswer="upward"
                        options={["upward", "downward"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerExample2Direction"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example2-yintercept" maxWidth="xl">
        <Block id="example2-yintercept" padding="sm">
            <EditableParagraph id="para-example2-yintercept" blockId="example2-yintercept">
                The y-intercept is at y ={" "}
                <InlineFeedback
                    varName="answerExample2YIntercept"
                    correctValue="1"
                    position="mid-sentence"
                    successMessage="✓"
                    failureMessage="— check the value of c"
                    hint="The y-intercept equals c"
                >
                    <InlineClozeInput
                        varName="answerExample2YIntercept"
                        correctAnswer="1"
                        {...clozePropsFromDefinition(getVariableInfo("answerExample2YIntercept"))}
                    />
                </InlineFeedback>, and the vertex x-coordinate is x ={" "}
                <InlineFeedback
                    varName="answerExample2VertexX"
                    correctValue="1"
                    position="terminal"
                    successMessage="— correct! Using x = −b/(2a) = −(−6)/(2×3) = 6/6 = 1"
                    failureMessage="— use the formula x = −b/(2a)"
                    hint="x = −(−6) / (2 × 3)"
                >
                    <InlineClozeInput
                        varName="answerExample2VertexX"
                        correctAnswer="1"
                        {...clozePropsFromDefinition(getVariableInfo("answerExample2VertexX"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Example 3: f(x) = 0.5x² + 3
    <StackLayout key="layout-example3-equation" maxWidth="xl">
        <Block id="example3-equation" padding="sm">
            <EditableParagraph id="para-example3-equation" blockId="example3-equation">
                <strong>Example 3:</strong> Consider{" "}
                <InlineFormula
                    latex="f(x) = 0.5x^2 + 3"
                    colorMap={{}}
                />. Here a = 0.5, b = 0, and c = 3.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example3-width" maxWidth="xl">
        <Block id="example3-width" padding="sm">
            <EditableParagraph id="para-example3-width" blockId="example3-width">
                Compared to the standard parabola y = x², this curve is{" "}
                <InlineFeedback
                    varName="answerExample3Width"
                    correctValue="wider"
                    position="terminal"
                    successMessage="— exactly! When |a| < 1, the parabola is wider and flatter"
                    failureMessage="— remember what happens when |a| is less than 1"
                    hint="Smaller |a| means a wider, flatter curve"
                >
                    <InlineClozeChoice
                        varName="answerExample3Width"
                        correctAnswer="wider"
                        options={["wider", "narrower", "same width"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerExample3Width"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example3-yintercept" maxWidth="xl">
        <Block id="example3-yintercept" padding="sm">
            <EditableParagraph id="para-example3-yintercept" blockId="example3-yintercept">
                The y-intercept is at y ={" "}
                <InlineFeedback
                    varName="answerExample3YIntercept"
                    correctValue="3"
                    position="terminal"
                    successMessage="— correct! The vertex is at (0, 3) since b = 0"
                    failureMessage="— the y-intercept equals c"
                    hint="Look at the constant term"
                >
                    <InlineClozeInput
                        varName="answerExample3YIntercept"
                        correctAnswer="3"
                        {...clozePropsFromDefinition(getVariableInfo("answerExample3YIntercept"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Example 4: f(x) = -2x² + 8x - 5
    <StackLayout key="layout-example4-equation" maxWidth="xl">
        <Block id="example4-equation" padding="sm">
            <EditableParagraph id="para-example4-equation" blockId="example4-equation">
                <strong>Example 4:</strong> Consider{" "}
                <InlineFormula
                    latex="f(x) = -2x^2 + 8x - 5"
                    colorMap={{}}
                />. Here a = −2, b = 8, and c = −5.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example4-direction" maxWidth="xl">
        <Block id="example4-direction" padding="sm">
            <EditableParagraph id="para-example4-direction" blockId="example4-direction">
                Since a = −2 is negative, the parabola opens{" "}
                <InlineFeedback
                    varName="answerExample4Direction"
                    correctValue="downward"
                    position="terminal"
                    successMessage="— right! Negative a means the parabola frowns downward"
                    failureMessage="— think about what negative a means"
                    hint="Negative a flips the parabola upside down"
                >
                    <InlineClozeChoice
                        varName="answerExample4Direction"
                        correctAnswer="downward"
                        options={["upward", "downward"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerExample4Direction"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-example4-vertex" maxWidth="xl">
        <Block id="example4-vertex" padding="sm">
            <EditableParagraph id="para-example4-vertex" blockId="example4-vertex">
                The vertex x-coordinate is x ={" "}
                <InlineFeedback
                    varName="answerExample4VertexX"
                    correctValue="2"
                    position="terminal"
                    successMessage="— perfect! x = −8/(2×−2) = −8/−4 = 2"
                    failureMessage="— use the vertex formula x = −b/(2a)"
                    hint="x = −8 / (2 × −2)"
                >
                    <InlineClozeInput
                        varName="answerExample4VertexX"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo("answerExample4VertexX"))}
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
