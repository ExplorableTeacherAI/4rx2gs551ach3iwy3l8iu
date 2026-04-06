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

// Reactive visualization for coefficient b
function CoefficientBViz() {
    const b = useVar("exploreB", 0) as number;
    const setVar = useSetVar();

    // For y = x² + bx, vertex is at x = -b/2
    const vertexX = -b / 2;
    const vertexY = vertexX * vertexX + b * vertexX;

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-6, 6], y: [-5, 5] }}
                movablePoints={[
                    {
                        initial: [vertexX, vertexY],
                        color: "#8E90F5",
                        position: [vertexX, vertexY],
                        constrain: (point) => {
                            // Constrain to the path where vertex moves as b changes
                            // For y = x² + bx, vertex is at (-b/2, -b²/4)
                            // Rearranging: if x = -b/2, then b = -2x
                            // And y = x² + (-2x)x = x² - 2x² = -x²
                            const x = point[0];
                            const constrainedX = Math.max(-3, Math.min(3, x));
                            const constrainedY = -constrainedX * constrainedX;
                            return [constrainedX, constrainedY];
                        },
                        onChange: (point) => {
                            // From vertex x-position, compute b
                            // x = -b/2, so b = -2x
                            const newB = -2 * point[0];
                            if (newB >= -4 && newB <= 4) {
                                setVar("exploreB", Math.round(newB * 2) / 2);
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
                        domain: [-6, 6] as [number, number],
                    },
                    // Active parabola y = x² + bx
                    {
                        type: "function",
                        fn: (x: number) => x * x + b * x,
                        color: "#8E90F5",
                        weight: 3,
                        domain: [-6, 6] as [number, number],
                    },
                    // Y-intercept point (always at origin for this simplified case)
                    {
                        type: "point",
                        x: 0,
                        y: 0,
                        color: "#F7B23B",
                    },
                    // Axis of symmetry
                    {
                        type: "segment",
                        point1: [vertexX, -5],
                        point2: [vertexX, 5],
                        color: "#8E90F5",
                        weight: 1,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="coefficient-b-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the vertex left and right",
                        position: { x: "50%", y: "50%" },
                    },
                ]}
            />
        </div>
    );
}

// Reactive text showing the vertex formula
function VertexXDisplay() {
    const b = useVar("exploreB", 0) as number;
    const vertexX = -b / 2;
    return <span>{vertexX.toFixed(1)}</span>;
}

export const coefficientBBlocks: ReactElement[] = [
    // Section heading
    <StackLayout key="layout-coeff-b-heading" maxWidth="xl">
        <Block id="coeff-b-heading" padding="md">
            <EditableH2 id="h2-coeff-b-heading" blockId="coeff-b-heading">
                The "b" Coefficient: Horizontal Movement
            </EditableH2>
        </Block>
    </StackLayout>,

    // Opening explanation
    <StackLayout key="layout-coeff-b-intro" maxWidth="xl">
        <Block id="coeff-b-intro" padding="sm">
            <EditableParagraph id="para-coeff-b-intro" blockId="coeff-b-intro">
                The coefficient{" "}
                <InlineSpotColor varName="exploreB" color="#8E90F5">b</InlineSpotColor>{" "}
                is the trickiest of the three. It doesn't just shift the parabola left or right. Instead, it moves the vertex along a curved path while the parabola keeps passing through the y-intercept.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Vertex formula explanation
    <StackLayout key="layout-coeff-b-vertex" maxWidth="xl">
        <Block id="coeff-b-vertex" padding="sm">
            <EditableParagraph id="para-coeff-b-vertex" blockId="coeff-b-vertex">
                The x-coordinate of the vertex (the turning point) is given by{" "}
                <InlineFormula
                    latex="x = -\frac{\clr{b}{b}}{2\clr{a}{a}}"
                    colorMap={{ b: "#8E90F5", a: "#62D0AD" }}
                />. When a = 1, this simplifies to{" "}
                <InlineFormula
                    latex="x = -\frac{\clr{b}{b}}{2}"
                    colorMap={{ b: "#8E90F5" }}
                />. So if{" "}
                <InlineSpotColor varName="exploreB" color="#8E90F5">b</InlineSpotColor>{" "}
                = 2, the vertex is at x = −1. If{" "}
                <InlineSpotColor varName="exploreB" color="#8E90F5">b</InlineSpotColor>{" "}
                = −4, the vertex is at x = 2.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive exploration
    <SplitLayout key="layout-coeff-b-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="coeff-b-explore-text" padding="sm">
                <EditableParagraph id="para-coeff-b-explore-text" blockId="coeff-b-explore-text">
                    The indigo curve shows{" "}
                    <InlineFormula
                        latex="y = x^2 + \clr{b}{b}x"
                        colorMap={{ b: "#8E90F5" }}
                    />{" "}
                    where{" "}
                    <InlineSpotColor varName="exploreB" color="#8E90F5">b</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="exploreB"
                        {...numberPropsFromDefinition(getVariableInfo("exploreB"))}
                    />. The vertex is at x = <VertexXDisplay />.
                </EditableParagraph>
            </Block>
            <Block id="coeff-b-explore-observation" padding="sm">
                <EditableParagraph id="para-coeff-b-explore-observation" blockId="coeff-b-explore-observation">
                    Drag the indigo vertex point left and right. Notice two things: the amber dot at the origin (the y-intercept) stays fixed, and the dashed vertical line (the axis of symmetry) moves with the vertex. The parabola pivots around its y-intercept.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="coeff-b-viz" padding="sm" hasVisualization>
            <CoefficientBViz />
        </Block>
    </SplitLayout>,

    // Assessment question
    <StackLayout key="layout-coeff-b-question" maxWidth="xl">
        <Block id="coeff-b-question" padding="md">
            <EditableParagraph id="para-coeff-b-question" blockId="coeff-b-question">
                For the function{" "}
                <InlineFormula
                    latex="f(x) = x^2 + 2x + 5"
                    colorMap={{}}
                />, where a = 1 and b = 2, the x-coordinate of the vertex is at x ={" "}
                <InlineFeedback
                    varName="answerVertexX"
                    correctValue="-1"
                    position="terminal"
                    successMessage="— correct! Using x = −b/(2a) = −2/(2×1) = −1"
                    failureMessage="— not quite."
                    hint="Use the formula x = −b/(2a)"
                    visualizationHint={{
                        blockId: "coeff-b-viz",
                        hintKey: "feedback-vertex-x",
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the vertex until b = 2, then read the x-coordinate",
                                position: { x: "40%", y: "55%" },
                                completionVar: "exploreB",
                                completionValue: 2,
                                completionTolerance: 0.5,
                            },
                        ],
                        label: "Find it in the graph",
                        resetVars: { exploreB: 0 },
                    }}
                >
                    <InlineClozeInput
                        varName="answerVertexX"
                        correctAnswer="-1"
                        {...clozePropsFromDefinition(getVariableInfo("answerVertexX"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Key takeaway
    <StackLayout key="layout-coeff-b-summary" maxWidth="xl">
        <Block id="coeff-b-summary" padding="sm">
            <EditableParagraph id="para-coeff-b-summary" blockId="coeff-b-summary">
                Remember:{" "}
                <InlineSpotColor varName="exploreB" color="#8E90F5">b</InlineSpotColor>{" "}
                moves the vertex horizontally. The vertex x-coordinate is always at{" "}
                <InlineFormula
                    latex="x = -\frac{b}{2a}"
                    colorMap={{}}
                />. Positive b shifts the vertex left; negative b shifts it right.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
