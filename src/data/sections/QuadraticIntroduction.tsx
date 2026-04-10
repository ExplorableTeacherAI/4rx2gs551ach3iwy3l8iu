import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineFormula,
    InlineTooltip,
    Cartesian2D,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Reactive visualization showing a basic parabola with color-coded points
function IntroParabolaViz() {
    const a = useVar("coefficientA", 1) as number;
    const b = useVar("coefficientB", 0) as number;
    const c = useVar("coefficientC", 0) as number;
    const setVar = useSetVar();

    // Calculate vertex position
    const vertexX = a !== 0 ? -b / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Color constants matching the formula
    const COLOR_A = "#62D0AD"; // Teal for 'a'
    const COLOR_C = "#F7B23B"; // Amber for 'c'
    const COLOR_CURVE = "#6366f1"; // Soft indigo for f(x) curve

    // Use fixed x-positions for the draggable points - they move along the curve
    // Points are symmetric about the vertex
    const pointOffset = 2.5; // Distance from vertex on x-axis
    const rightX = vertexX + pointOffset;
    const leftX = vertexX - pointOffset;

    // Calculate y-values on the curve at these x positions
    const rightY = a * rightX * rightX + b * rightX + c;
    const leftY = a * leftX * leftX + b * leftX + c;

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-6, 6], y: [-8, 6] }}
                movablePoints={[
                    // Right point - drag along the curve to change steepness
                    {
                        initial: [rightX, rightY],
                        color: COLOR_A,
                        position: [rightX, rightY],
                        constrain: (point) => {
                            // Constrain point to stay on the parabola
                            // User drags vertically, we compute corresponding x that keeps it on curve
                            const targetY = point[1];
                            // For y = ax² + bx + c, solve for x given y (on right side of vertex)
                            // We keep x on the right side of vertex
                            const clampedY = Math.max(-7, Math.min(5, targetY));
                            // Compute x from y: ax² + bx + (c - y) = 0
                            const disc = b * b - 4 * a * (c - clampedY);
                            if (disc >= 0 && a !== 0) {
                                const sqrtDisc = Math.sqrt(disc);
                                const x1 = (-b + sqrtDisc) / (2 * a);
                                const x2 = (-b - sqrtDisc) / (2 * a);
                                // Pick the x on the right side of vertex
                                const newX = a > 0 ? Math.max(x1, x2) : Math.min(x1, x2);
                                if (newX > vertexX + 0.5 && newX < 5.5) {
                                    return [newX, clampedY];
                                }
                            }
                            return [rightX, rightY];
                        },
                        onChange: (point) => {
                            // Compute new 'a' from the point position
                            // y = ax² + bx + c → a = (y - bx - c) / x²
                            const x = point[0];
                            const y = point[1];
                            if (Math.abs(x - vertexX) > 0.3) {
                                const newA = (y - b * x - c) / (x * x);
                                if (Math.abs(newA) >= 0.1 && Math.abs(newA) <= 3) {
                                    setVar("coefficientA", Math.round(newA * 20) / 20);
                                }
                            }
                        },
                    },
                    // Left point - mirrors the right point
                    {
                        initial: [leftX, leftY],
                        color: COLOR_A,
                        position: [leftX, leftY],
                        constrain: (point) => {
                            const targetY = point[1];
                            const clampedY = Math.max(-7, Math.min(5, targetY));
                            const disc = b * b - 4 * a * (c - clampedY);
                            if (disc >= 0 && a !== 0) {
                                const sqrtDisc = Math.sqrt(disc);
                                const x1 = (-b + sqrtDisc) / (2 * a);
                                const x2 = (-b - sqrtDisc) / (2 * a);
                                // Pick the x on the left side of vertex
                                const newX = a > 0 ? Math.min(x1, x2) : Math.max(x1, x2);
                                if (newX < vertexX - 0.5 && newX > -5.5) {
                                    return [newX, clampedY];
                                }
                            }
                            return [leftX, leftY];
                        },
                        onChange: (point) => {
                            const x = point[0];
                            const y = point[1];
                            if (Math.abs(x - vertexX) > 0.3) {
                                const newA = (y - b * x - c) / (x * x);
                                if (Math.abs(newA) >= 0.1 && Math.abs(newA) <= 3) {
                                    setVar("coefficientA", Math.round(newA * 20) / 20);
                                }
                            }
                        },
                    },
                    // Y-intercept point (amber 'c' point)
                    {
                        initial: [0, c],
                        color: COLOR_C,
                        position: [0, c],
                        constrain: "vertical",
                        onChange: (point) => {
                            // Smooth continuous update
                            const newC = Math.round(point[1] * 4) / 4;
                            if (newC >= -6 && newC <= 5) {
                                setVar("coefficientC", newC);
                            }
                        },
                    },
                ]}
                highlightVarName="introFormulaHighlight"
                plots={[
                    // Main parabola curve
                    {
                        type: "function",
                        fn: (x: number) => a * x * x + b * x + c,
                        color: COLOR_CURVE,
                        weight: 3,
                        highlightId: "fx",
                    },
                    // Axis of symmetry (dashed)
                    {
                        type: "segment",
                        point1: [vertexX, -8],
                        point2: [vertexX, 6],
                        color: "#94a3b8",
                        weight: 1,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="intro-parabola-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the teal points along the curve to change steepness",
                        position: { x: "70%", y: "30%" },
                    },
                ]}
            />
        </div>
    );
}

export const introductionBlocks: ReactElement[] = [
    // Title
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Quadratic Functions: The Shape of a Parabola
            </EditableH1>
        </Block>
    </StackLayout>,

    // Hook paragraph
    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Every time you throw a ball, water shoots from a fountain, or a rocket arcs through the sky, you're seeing a{" "}
                <InlineTooltip id="tooltip-intro-parabola" tooltip="A U-shaped curve formed by the graph of a quadratic function">
                    parabola
                </InlineTooltip>
                . This distinctive U-shaped curve appears everywhere in nature and engineering. But what controls whether the parabola opens wide or narrow? What makes it point up or down?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // The formula introduction
    <StackLayout key="layout-intro-formula-heading" maxWidth="xl">
        <Block id="intro-formula-heading" padding="sm">
            <EditableH2 id="h2-intro-formula-heading" blockId="intro-formula-heading">
                The Standard Form
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-formula-explanation" maxWidth="xl">
        <Block id="intro-formula-explanation" padding="sm">
            <EditableParagraph id="para-intro-formula-explanation" blockId="intro-formula-explanation">
                A quadratic function is written in standard form as{" "}
                <InlineFormula
                    latex="\clr{fx}{f(x)} = \clr{a}{a}x^2 + \clr{b}{b}x + \clr{c}{c}"
                    colorMap={{ fx: "#6366f1", a: "#62D0AD", b: "#8E90F5", c: "#F7B23B" }}
                />
                . Each coefficient has a specific job:{" "}
                <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor>{" "}
                controls whether the parabola opens upward (when positive) or downward (when negative), and how steep or wide it is (larger values make it narrower).{" "}
                <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor>{" "}
                shifts the turning point (vertex) left or right along the x-axis, working with{" "}
                <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor>{" "}
                in the formula x = −b/(2a).{" "}
                <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor>{" "}
                is the y-intercept, showing exactly where the parabola crosses the y-axis at point (0, c).
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive formula with matching curve color and hover highlight
    <StackLayout key="layout-intro-interactive-formula" maxWidth="xl">
        <Block id="intro-interactive-formula" padding="md">
            <FormulaBlock
                latex="\highlight{fx}{f(x)} = \scrub{coefficientA}x^2 + \scrub{coefficientB}x + \scrub{coefficientC}"
                variables={scrubVarsFromDefinitions(["coefficientA", "coefficientB", "coefficientC"])}
                linkedHighlights={{
                    fx: {
                        varName: "introFormulaHighlight",
                        color: "#6366f1",
                        bgColor: "rgba(99, 102, 241, 0.2)",
                    },
                }}
            />
        </Block>
    </StackLayout>,

    // Interactive exploration
    <SplitLayout key="layout-intro-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="intro-explore-text" padding="sm">
                <EditableParagraph id="para-intro-explore-text" blockId="intro-explore-text">
                    The graph shows a parabola with{" "}
                    <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientA"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientA"))}
                    />,{" "}
                    <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientB"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientB"))}
                    />, and{" "}
                    <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientC"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientC"))}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="intro-explore-instruction" padding="sm">
                <EditableParagraph id="para-intro-explore-instruction" blockId="intro-explore-instruction">
                    Drag the two teal points horizontally to widen or narrow the parabola. Pulling them apart makes the curve wider, pushing them together makes it steeper. Or drag the amber point on the y-axis to shift everything up and down.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="intro-explore-viz" padding="sm" hasVisualization>
            <IntroParabolaViz />
        </Block>
    </SplitLayout>,
];
